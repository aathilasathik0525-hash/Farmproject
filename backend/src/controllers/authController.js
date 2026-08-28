const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const {
  initiateAadhaarOtp,
  verifyAadhaarOtp,
  consumeVerifiedIdentityToken,
  hashAadhaar,
  maskAadhaar,
  generateCustomerId,
} = require('../services/identity/aadhaarService');
const { normalizeAddress } = require('../utils/addressNormalizer');

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET || 'farmdirect_secret_jwt_key_2026', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// POST /api/auth/aadhaar/send-otp
const sendAadhaarOtp = async (req, res, next) => {
  try {
    const { aadhaarNumber, mobile } = req.body;
    const result = await initiateAadhaarOtp({ aadhaarNumber, mobile });
    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/aadhaar/verify-otp
const verifyAadhaarOtpController = async (req, res, next) => {
  try {
    const { txnId, otp } = req.body;
    const result = await verifyAadhaarOtp({ txnId, otp });
    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    let { name, email, phone, password, role, preferredLanguage, profileData, verificationToken, aadhaarNumber } = req.body;
    if (role === 'CUSTOMER') role = 'BUYER'; // Internal mapping to DB schema

    const lang = preferredLanguage || profileData?.preferredLanguage || 'ta-IN';

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: existingUser.email === email ? 'Email already registered' : 'Phone already registered',
      });
    }

    // Process customer verification data if role is BUYER / CUSTOMER
    let verifiedIdentity = null;
    if (role === 'BUYER') {
      if (verificationToken) {
        verifiedIdentity = consumeVerifiedIdentityToken(verificationToken);
      } else if (aadhaarNumber) {
        // Fallback direct verification for dev/testing
        const aHash = hashAadhaar(aadhaarNumber);
        const existingAadhaar = await prisma.customerVerification.findUnique({
          where: { aadhaarHash: aHash },
        });
        if (existingAadhaar) {
          return res.status(409).json({
            success: false,
            message: 'This Aadhaar identity is already linked to an existing FARMDirect customer account.',
          });
        }
        verifiedIdentity = {
          customerId: generateCustomerId(),
          aadhaarHash: aHash,
          maskedAadhaar: maskAadhaar(aadhaarNumber),
          verifiedMobile: phone,
          verifiedAt: new Date(),
        };
      } else {
        // For development convenience, auto-generate verified customer ID and mock token
        const devAadhaar = `2345${Math.floor(10000000 + Math.random() * 90000000)}`;
        verifiedIdentity = {
          customerId: generateCustomerId(),
          aadhaarHash: hashAadhaar(devAadhaar),
          maskedAadhaar: maskAadhaar(devAadhaar),
          verifiedMobile: phone,
          verifiedAt: new Date(),
        };
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          phone,
          passwordHash,
          role,
          preferredLanguage: lang,
        },
      });

      if (role === 'FARMER') {
        await tx.farmerProfile.create({
          data: {
            userId: newUser.id,
            farmName: profileData?.farmName || null,
            village: profileData?.village || '',
            district: profileData?.district || '',
            state: profileData?.state || 'Tamil Nadu',
            pincode: profileData?.pincode || null,
            experience: profileData?.experience ? parseInt(profileData.experience) : null,
            landHolding: profileData?.landHolding ? parseFloat(profileData.landHolding) : null,
            preferredLanguage: lang,
            fpoId: profileData?.fpoId || null,
            verificationStatus: 'VERIFIED',
          },
        });
      } else if (role === 'BUYER') {
        const buyer = await tx.buyerProfile.create({
          data: {
            userId: newUser.id,
            companyName: profileData?.companyName || null,
            buyerType: profileData?.buyerType || 'INDIVIDUAL',
          },
        });

        if (verifiedIdentity) {
          await tx.customerVerification.create({
            data: {
              buyerId: buyer.id,
              customerId: verifiedIdentity.customerId,
              verificationStatus: 'VERIFIED',
              aadhaarHash: verifiedIdentity.aadhaarHash,
              maskedAadhaar: verifiedIdentity.maskedAadhaar,
              verifiedMobile: verifiedIdentity.verifiedMobile || phone,
              verifiedAt: new Date(),
            },
          });
        }

        // Save delivery address + fingerprint if provided
        const addrData = profileData?.deliveryAddress;
        if (addrData && addrData.addressLine1 && addrData.city && addrData.pincode) {
          const addrResult = normalizeAddress({
            addressLine1: addrData.addressLine1,
            addressLine2: addrData.addressLine2,
            city: addrData.city,
            district: addrData.district,
            state: addrData.state,
            pincode: addrData.pincode,
          });

          const { fingerprint, normalizedAddress: normalizedAddr, unitOrFlat, street, city, district, state, pincode } = addrResult;

          // Upsert AddressFingerprint (same physical address used before = same fingerprint)
          let afp = await tx.addressFingerprint.findUnique({ where: { fingerprint } });
          if (!afp) {
            afp = await tx.addressFingerprint.create({
              data: {
                fingerprint,
                normalizedAddress: normalizedAddr.slice(0, 500),
                unitOrFlat: unitOrFlat?.slice(0, 100) || null,
                street: street?.slice(0, 200) || null,
                city: addrData.city,
                district: addrData.district || addrData.city,
                state: addrData.state || 'Tamil Nadu',
                pincode: addrData.pincode,
                riskStatus: 'NORMAL',
                riskScore: 0,
              },
            });
          }

          await tx.deliveryAddress.create({
            data: {
              buyerId: buyer.id,
              addressFingerprintId: afp.id,
              label: addrData.label || 'Home',
              addressLine1: addrData.addressLine1,
              addressLine2: addrData.addressLine2 || null,
              city: addrData.city,
              district: addrData.district || addrData.city,
              state: addrData.state || 'Tamil Nadu',
              pincode: addrData.pincode,
              isDefault: true,
            },
          });
        }
      } else if (role === 'FPO') {
        if (!profileData?.fpoId) {
          throw new Error('FPO ID required for FPO role');
        }
        await tx.fPOProfile.create({
          data: {
            userId: newUser.id,
            fpoId: profileData.fpoId,
            designation: profileData?.designation || null,
          },
        });
      } else if (role === 'LOGISTICS') {
        await tx.logisticsProfile.create({
          data: {
            userId: newUser.id,
            companyName: profileData?.companyName || null,
          },
        });
      }

      return newUser;
    });

    const token = generateToken(user.id, user.role);

    const userWithProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        preferredLanguage: true,
        farmerProfile: {
          select: {
            id: true,
            farmName: true,
            village: true,
            district: true,
            state: true,
            preferredLanguage: true,
            verificationStatus: true,
          },
        },
        buyerProfile: {
          select: {
            id: true,
            buyerType: true,
            addresses: true,
            verification: {
              select: {
                customerId: true,
                maskedAadhaar: true,
                verificationStatus: true,
                verifiedAt: true,
              },
            },
          },
        },
        fpoProfile: { select: { id: true, fpoId: true } },
        logisticsProfile: { select: { id: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: userWithProfile,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        farmerProfile: {
          select: {
            id: true,
            farmName: true,
            verificationStatus: true,
            village: true,
            district: true,
            state: true,
            preferredLanguage: true,
          },
        },
        buyerProfile: {
          select: {
            id: true,
            buyerType: true,
            companyName: true,
            addresses: true,
            verification: {
              select: {
                customerId: true,
                maskedAadhaar: true,
                verificationStatus: true,
                verifiedAt: true,
              },
            },
          },
        },
        fpoProfile: { select: { id: true, fpoId: true } },
        logisticsProfile: { select: { id: true } },
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user.id, user.role);

    const { passwordHash, ...safeUser } = user;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: safeUser,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        preferredLanguage: true,
        createdAt: true,
        farmerProfile: {
          select: {
            id: true,
            farmName: true,
            village: true,
            district: true,
            state: true,
            experience: true,
            landHolding: true,
            verificationStatus: true,
            preferredLanguage: true,
            bio: true,
            profileImage: true,
            fpoId: true,
          },
        },
        buyerProfile: {
          select: {
            id: true,
            companyName: true,
            buyerType: true,
            addresses: true,
            verification: {
              select: {
                customerId: true,
                maskedAadhaar: true,
                verificationStatus: true,
                verifiedAt: true,
              },
            },
          },
        },
        fpoProfile: { select: { id: true, fpoId: true, designation: true } },
        logisticsProfile: { select: { id: true, companyName: true } },
      },
    });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, preferredLanguage, profileData } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (preferredLanguage) updateData.preferredLanguage = preferredLanguage;

    await prisma.$transaction(async (tx) => {
      if (Object.keys(updateData).length > 0) {
        await tx.user.update({ where: { id: req.user.id }, data: updateData });
      }

      if (req.user.role === 'FARMER' && req.user.farmerProfile) {
        const farmerUpdate = {};
        if (profileData?.farmName !== undefined) farmerUpdate.farmName = profileData.farmName;
        if (profileData?.village !== undefined) farmerUpdate.village = profileData.village;
        if (profileData?.district !== undefined) farmerUpdate.district = profileData.district;
        if (profileData?.state !== undefined) farmerUpdate.state = profileData.state;
        if (profileData?.experience !== undefined) farmerUpdate.experience = parseInt(profileData.experience);
        if (profileData?.landHolding !== undefined) farmerUpdate.landHolding = parseFloat(profileData.landHolding);
        if (profileData?.bio !== undefined) farmerUpdate.bio = profileData.bio;
        if (preferredLanguage || profileData?.preferredLanguage) {
          farmerUpdate.preferredLanguage = preferredLanguage || profileData.preferredLanguage;
        }

        if (Object.keys(farmerUpdate).length > 0) {
          await tx.farmerProfile.update({
            where: { id: req.user.farmerProfile.id },
            data: farmerUpdate,
          });
        }
      } else if ((req.user.role === 'BUYER' || req.user.role === 'CUSTOMER') && req.user.buyerProfile) {
        if (profileData) {
          await tx.buyerProfile.update({
            where: { id: req.user.buyerProfile.id },
            data: {
              companyName: profileData.companyName,
              buyerType: profileData.buyerType,
            },
          });
        }
      }
    });

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  sendAadhaarOtp,
  verifyAadhaarOtpController,
};
