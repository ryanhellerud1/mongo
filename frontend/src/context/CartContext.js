import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Create context
const CartContext = createContext();

// Initial state
const initialState = {
  cartItems: [],
  shippingAddress: {},
  paymentMethod: '',
  itemsPrice: 0,
  shippingPrice: 0,
  taxPrice: 0,
  totalPrice: 0,
};

// Cart reducer function
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'CART_ADD_ITEM': {
      const newItem = action.payload;
      const existingItem = state.cartItems.find(
        (item) => item._id === newItem._id && 
        ((!item.variant && !newItem.variant) || 
        (item.variant && newItem.variant && item.variant._id === newItem.variant._id))
      );

      let cartItems;
      if (existingItem) {
        // Update existing item quantity
        cartItems = state.cartItems.map((item) =>
          (item._id === existingItem._id && 
           ((!item.variant && !newItem.variant) || 
           (item.variant && newItem.variant && item.variant._id === newItem.variant._id)))
            ? newItem
            : item
        );
      } else {
        // Add new item
        cartItems = [...state.cartItems, newItem];
      }

      // Save to localStorage
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      
      return { ...state, cartItems };
    }

    case 'CART_REMOVE_ITEM': {
      const cartItems = state.cartItems.filter(
        (item) => 
          item._id !== action.payload._id || 
          (item.variant && action.payload.variant && 
           item.variant._id !== action.payload.variant._id)
      );
      
      // Save to localStorage
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      
      return { ...state, cartItems };
    }

    case 'CART_CLEAR_ITEMS':
      localStorage.removeItem('cartItems');
      return { ...state, cartItems: [] };

    case 'SAVE_SHIPPING_ADDRESS':
      localStorage.setItem('shippingAddress', JSON.stringify(action.payload));
      return { ...state, shippingAddress: action.payload };

    case 'SAVE_PAYMENT_METHOD':
      localStorage.setItem('paymentMethod', JSON.stringify(action.payload));
      return { ...state, paymentMethod: action.payload };

    case 'CALCULATE_PRICES': {
      // Calculate prices
      const itemsPrice = state.cartItems.reduce(
        (acc, item) => acc + item.price * item.qty,
        0
      );
      
      // Shipping price (free shipping for orders over $100)
      const shippingPrice = itemsPrice > 100 ? 0 : 10;
      
      // Tax price (10% tax)
      const taxPrice = Number((0.10 * itemsPrice).toFixed(2));
      
      // Total price
      const totalPrice = (itemsPrice + shippingPrice + taxPrice);
      
      return {
        ...state,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
      };
    }

    default:
      return state;
  }
};

// Provider component
export const CartProvider = ({ children }) => {
  // Get cart data from localStorage on initial load
  const storedCartItems = localStorage.getItem('cartItems')
    ? JSON.parse(localStorage.getItem('cartItems'))
    : [];
  
  const storedShippingAddress = localStorage.getItem('shippingAddress')
    ? JSON.parse(localStorage.getItem('shippingAddress'))
    : {};
  
  const storedPaymentMethod = localStorage.getItem('paymentMethod')
    ? JSON.parse(localStorage.getItem('paymentMethod'))
    : '';

  // Create initial state with stored values
  const initialStateWithStorage = {
    ...initialState,
    cartItems: storedCartItems,
    shippingAddress: storedShippingAddress,
    paymentMethod: storedPaymentMethod,
  };
  
  const [state, dispatch] = useReducer(cartReducer, initialStateWithStorage);

  // Calculate prices whenever cart items change
  useEffect(() => {
    dispatch({ type: 'CALCULATE_PRICES' });
  }, [state.cartItems]);

  // Cart actions
  const addToCart = (product, qty, variant = null) => {
    const item = {
      _id: product._id,
      name: product.name,
      image: product.images && product.images.length > 0 ? product.images[0] : '',
      price: variant ? variant.price || product.price : product.price,
      countInStock: variant ? variant.countInStock || product.countInStock : product.countInStock,
      qty: qty,
    };

    if (variant) {
      item.variant = {
        _id: variant._id,
        name: variant.name,
        price: variant.price,
      };
    }

    dispatch({
      type: 'CART_ADD_ITEM',
      payload: item,
    });
  };

  const removeFromCart = (item) => {
    dispatch({
      type: 'CART_REMOVE_ITEM',
      payload: item,
    });
  };

  const clearCart = () => {
    dispatch({ type: 'CART_CLEAR_ITEMS' });
  };

  const saveShippingAddress = (data) => {
    dispatch({
      type: 'SAVE_SHIPPING_ADDRESS',
      payload: data,
    });
  };

  const savePaymentMethod = (data) => {
    dispatch({
      type: 'SAVE_PAYMENT_METHOD',
      payload: data,
    });
  };

  // Expose context value
  const contextValue = {
    ...state,
    addToCart,
    removeFromCart,
    clearCart,
    saveShippingAddress,
    savePaymentMethod,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext; 