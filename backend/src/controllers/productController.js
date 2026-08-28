const prisma = require('../config/database');
const { validationResult } = require('express-validator');

// Pricing utility
// Farmer price is base. Additional charges: Collection (₹1/kg), Packaging (₹2/kg), Transport (₹5/kg), Platform (₹1/kg)
const calculatePriceBreakdown = (farmerPrice) => {
  const collectionCharge = 1.0;
  const packagingCharge = 2.0;
  const transportCharge = 5.0;
  const platformFee = 1.0;
  const totalCharges = collectionCharge + packagingCharge + transportCharge + platformFee;
  const customerPrice = farmerPrice + totalCharges;
  return {
    farmerPrice,
    collectionCharge,
    packagingCharge,
    transportCharge,
    platformFee,
    totalCharges,
    customerPrice,
  };
};

// GET /api/products
const getProducts = async (req, res, next) => {
  try {
    const { category, search, minPrice, maxPrice, organic, grade, location, farmerId } = req.query;

    const where = { isActive: true };

    if (category) {
      where.category = { slug: category };
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { farmer: { village: { contains: search } } },
        { farmer: { district: { contains: search } } },
      ];
    }
    if (farmerId) {
      where.farmerId = farmerId;
    }
    if (organic !== undefined) {
      where.isOrganic = organic === 'true';
    }
    if (grade) {
      where.qualityGrade = grade;
    }
    if (minPrice || maxPrice) {
      where.farmerPrice = {};
      if (minPrice) where.farmerPrice.gte = parseFloat(minPrice);
      if (maxPrice) where.farmerPrice.lte = parseFloat(maxPrice);
    }
    if (location) {
      where.farmer = {
        ...where.farmer,
        OR: [
          { district: { contains: location } },
          { village: { contains: location } },
        ],
      };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        inventory: true,
        farmer: {
          include: {
            user: { select: { name: true, phone: true } },
            fpo: { select: { name: true, district: true } },
          },
        },
        reviews: {
          select: { rating: true, comment: true, createdAt: true, buyer: { select: { user: { select: { name: true } } } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Format products with transparent price breakdown
    const enrichedProducts = products.map((prod) => {
      const breakdown = calculatePriceBreakdown(prod.farmerPrice);
      const avgRating = prod.reviews.length
        ? prod.reviews.reduce((acc, r) => acc + r.rating, 0) / prod.reviews.length
        : 4.8;

      let parsedImages = [];
      try {
        parsedImages = JSON.parse(prod.images || '[]');
      } catch (e) {
        parsedImages = [];
      }

      return {
        ...prod,
        images: parsedImages,
        priceBreakdown: breakdown,
        averageRating: Number(avgRating.toFixed(1)),
        reviewCount: prod.reviews.length,
        availableStock: prod.inventory?.availableQty || 0,
      };
    });

    res.json({ success: true, count: enrichedProducts.length, data: enrichedProducts });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.productCategory.findMany({
      include: {
        _count: { select: { products: true } },
      },
    });
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id
const getProductById = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        inventory: true,
        farmer: {
          include: {
            user: { select: { name: true, phone: true, email: true } },
            fpo: { select: { id: true, name: true, district: true, contactPhone: true } },
          },
        },
        reviews: {
          include: {
            buyer: { include: { user: { select: { name: true } } } },
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let parsedImages = [];
    try {
      parsedImages = JSON.parse(product.images || '[]');
    } catch (e) {
      parsedImages = [];
    }

    const breakdown = calculatePriceBreakdown(product.farmerPrice);
    const avgRating = product.reviews.length
      ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
      : 4.8;

    res.json({
      success: true,
      data: {
        ...product,
        images: parsedImages,
        priceBreakdown: breakdown,
        averageRating: Number(avgRating.toFixed(1)),
        availableStock: product.inventory?.availableQty || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/products (Farmer only)
const createProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const farmerId = req.user.farmerProfile?.id;
    if (!farmerId) {
      return res.status(403).json({ success: false, message: 'Only registered farmers can create products' });
    }

    const {
      name,
      categoryId,
      description,
      unit = 'kg',
      farmerPrice,
      qualityGrade = 'A',
      isOrganic = false,
      harvestDate,
      quantity,
      images = [],
    } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          farmerId,
          categoryId,
          name,
          description,
          unit,
          farmerPrice: parseFloat(farmerPrice),
          qualityGrade,
          isOrganic: Boolean(isOrganic),
          harvestDate: harvestDate ? new Date(harvestDate) : new Date(),
          images: JSON.stringify(images),
        },
      });

      const inventory = await tx.inventory.create({
        data: {
          productId: product.id,
          availableQty: parseFloat(quantity) || 0,
        },
      });

      return { ...product, inventory };
    });

    res.status(201).json({
      success: true,
      message: 'Product listed successfully with your direct price',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/products/:id (Farmer owner only)
const updateProduct = async (req, res, next) => {
  try {
    const farmerId = req.user.farmerProfile?.id;
    const existing = await prisma.product.findUnique({ where: { id: req.params.id } });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (existing.farmerId !== farmerId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this product' });
    }

    const {
      name,
      categoryId,
      description,
      unit,
      farmerPrice,
      qualityGrade,
      isOrganic,
      harvestDate,
      quantity,
      images,
      isActive,
    } = req.body;

    const updated = await prisma.$transaction(async (tx) => {
      const prod = await tx.product.update({
        where: { id: req.params.id },
        data: {
          name: name || undefined,
          categoryId: categoryId || undefined,
          description: description !== undefined ? description : undefined,
          unit: unit || undefined,
          farmerPrice: farmerPrice !== undefined ? parseFloat(farmerPrice) : undefined,
          qualityGrade: qualityGrade || undefined,
          isOrganic: isOrganic !== undefined ? Boolean(isOrganic) : undefined,
          harvestDate: harvestDate ? new Date(harvestDate) : undefined,
          images: images ? JSON.stringify(images) : undefined,
          isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        },
      });

      if (quantity !== undefined) {
        await tx.inventory.upsert({
          where: { productId: req.params.id },
          create: { productId: req.params.id, availableQty: parseFloat(quantity) },
          update: { availableQty: parseFloat(quantity) },
        });
      }

      return prod;
    });

    res.json({ success: true, message: 'Product updated successfully', data: updated });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const farmerId = req.user.farmerProfile?.id;
    const existing = await prisma.product.findUnique({ where: { id: req.params.id } });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (existing.farmerId !== farmerId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await prisma.product.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });

    res.json({ success: true, message: 'Product removed from marketplace' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProducts,
  getCategories,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  calculatePriceBreakdown,
};
