# FarmDirect Database Schema & Entity Relationships

The relational data model is managed via Prisma ORM (ackend/prisma/schema.prisma).

## Core Entities & Relational Design

1. **User & Profiles**:
   - User (id, email, phone, role, passwordHash, createdAt)
   - FarmerProfile (userId, farmName, village, district, landHolding, verificationStatus)
   - BuyerProfile (userId, businessType, gstNumber)
   - FPOProfile (userId, fpoId, designation)
   - LogisticsProfile (userId, companyName, vehicleId)

2. **Produce & Inventory**:
   - Product (id, farmerId, categoryId, name, nameTamil, farmerPrice, unit, harvestDate, isOrganic)
   - ProductCategory (id, name, slug, description)
   - Inventory (id, productId, totalQty, availableQty, reservedQty)

3. **Orders & Transactions**:
   - Order (id, orderNumber, buyerId, totalFarmerAmount, totalCharges, totalAmount, status, placedAt)
   - OrderItem (id, orderId, productId, quantity, farmerPrice, customerPrice, totalFarmerAmount)
   - OrderStatusHistory (id, orderId, status, note, updatedBy, createdAt)
   - Payment (id, orderId, amount, method, status, razorpayOrderId)
   - FarmerEarning (id, orderItemId, amount, status, paidAt)

4. **Aggregation & Supply Chain Coordination**:
   - FPO (id, name, registrationNumber, district, state)
   - Aggregation (id, orderId, fpoId, totalAggregatedQty, status, scheduledDate)
   - AggregationItem (id, aggregationId, farmerId, assignedQty)
   - CollectionCenter (id, fpoId, name, address, district, capacity)
   - Vehicle (id, registrationNumber, type, driverName, driverPhone)
   - Shipment (id, shipmentNumber, orderId, vehicleId, status, origin, destination)

5. **Dispatches & Communication**:
   - Notification (id, userId, channel [SMS|VOICE|IN_APP], title, message, messageTamil, isRead)
