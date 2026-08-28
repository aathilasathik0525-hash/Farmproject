import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('farmdirect_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // State for farmer conflict dialog
  const [farmerConflict, setFarmerConflict] = useState(null);

  useEffect(() => {
    localStorage.setItem('farmdirect_cart', JSON.stringify(cart));
  }, [cart]);

  // Current farmer represented in the cart
  const currentFarmer =
    cart.length > 0
      ? {
          id: cart[0].farmerId || cart[0].product.farmerId,
          name:
            cart[0].farmerName ||
            cart[0].product.farmer?.user?.name ||
            cart[0].product.farmer?.farmName ||
            'Farmer',
        }
      : null;

  /**
   * Add item to cart with Single Farmer Enforcement
   */
  const addToCart = (product, quantity = 10) => {
    const prodFarmerId = product.farmerId || product.farmer?.id;
    const prodFarmerName =
      product.farmer?.user?.name || product.farmer?.farmName || product.farmerName || 'Farmer';

    if (cart.length > 0 && currentFarmer && currentFarmer.id !== prodFarmerId) {
      // Trigger farmer conflict prompt
      setFarmerConflict({
        currentFarmerName: currentFarmer.name,
        newFarmerName: prodFarmerName,
        pendingProduct: product,
        pendingQuantity: quantity,
      });
      return {
        success: false,
        conflict: true,
        message: `Your cart contains products from ${currentFarmer.name}. You can only order from one farmer at a time.`,
      };
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          farmerId: prodFarmerId,
          farmerName: prodFarmerName,
          productName: product.name,
          unit: product.unit || 'kg',
          farmerPrice: product.farmerPrice,
          priceBreakdown: product.priceBreakdown,
          product,
          quantity,
        },
      ];
    });

    return { success: true };
  };

  /**
   * Clear cart and add new farmer's product
   */
  const clearAndAddToCart = (product, quantity = 10) => {
    const prodFarmerId = product.farmerId || product.farmer?.id;
    const prodFarmerName =
      product.farmer?.user?.name || product.farmer?.farmName || product.farmerName || 'Farmer';

    setCart([
      {
        productId: product.id,
        farmerId: prodFarmerId,
        farmerName: prodFarmerName,
        productName: product.name,
        unit: product.unit || 'kg',
        farmerPrice: product.farmerPrice,
        priceBreakdown: product.priceBreakdown,
        product,
        quantity,
      },
    ]);
    setFarmerConflict(null);
  };

  const closeFarmerConflict = () => {
    setFarmerConflict(null);
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setFarmerConflict(null);
  };

  // Price calculations
  const totalFarmerAmount = cart.reduce(
    (sum, item) => sum + item.product.farmerPrice * item.quantity,
    0
  );

  const totalCollectionCharges = cart.reduce(
    (sum, item) => sum + (item.product.priceBreakdown?.collectionCharge || 1) * item.quantity,
    0
  );

  const totalPackagingCharges = cart.reduce(
    (sum, item) => sum + (item.product.priceBreakdown?.packagingCharge || 2) * item.quantity,
    0
  );

  const totalTransportCharges = cart.reduce(
    (sum, item) => sum + (item.product.priceBreakdown?.transportCharge || 5) * item.quantity,
    0
  );

  const totalPlatformFees = cart.reduce(
    (sum, item) => sum + (item.product.priceBreakdown?.platformFee || 1) * item.quantity,
    0
  );

  const totalCharges =
    totalCollectionCharges + totalPackagingCharges + totalTransportCharges + totalPlatformFees;

  const totalAmount = totalFarmerAmount + totalCharges;

  const totalItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        currentFarmer,
        farmerConflict,
        closeFarmerConflict,
        clearAndAddToCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        itemCount: cart.length,
        totalItemCount,
        totalFarmerAmount,
        totalCollectionCharges,
        totalPackagingCharges,
        totalTransportCharges,
        totalPlatformFees,
        totalCharges,
        totalAmount,
      }}
    >
      {children}

      {/* Global Single-Farmer Cart Conflict Modal */}
      {farmerConflict && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
            backdropFilter: 'blur(2px)',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '480px',
              width: '100%',
              padding: '2rem',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
              border: '1.5px solid #fed7aa',
              background: '#ffffff',
            }}
          >
            <div style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '0.75rem' }}>
              ⚠️
            </div>
            <h3
              style={{
                fontSize: '1.25rem',
                color: 'var(--slate-900)',
                textAlign: 'center',
                marginBottom: '0.75rem',
              }}
            >
              One Farmer Per Order
            </h3>
            <p
              style={{
                fontSize: '0.95rem',
                color: 'var(--slate-600)',
                lineHeight: '1.5',
                textAlign: 'center',
                marginBottom: '1.5rem',
              }}
            >
              Your cart currently contains products from{' '}
              <strong style={{ color: '#166534' }}>{farmerConflict.currentFarmerName}</strong>. You
              can only order from one farmer at a time.
              <br />
              <br />
              Clear your current cart and switch to{' '}
              <strong style={{ color: '#166534' }}>{farmerConflict.newFarmerName}</strong>?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() =>
                  clearAndAddToCart(
                    farmerConflict.pendingProduct,
                    farmerConflict.pendingQuantity
                  )
                }
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem' }}
              >
                Clear Cart & Switch to {farmerConflict.newFarmerName}
              </button>

              <button
                type="button"
                onClick={closeFarmerConflict}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '0.75rem' }}
              >
                Keep Current Farmer ({farmerConflict.currentFarmerName})
              </button>
            </div>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
