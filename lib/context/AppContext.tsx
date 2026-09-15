'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserRole,
  Retailer,
  CartItem,
  Cart,
  EntityCartSummary,
  Product,
  MOQEvaluation,
  BillingEntity
} from '@/lib/types';
import {
  MOCK_RETAILERS,
  MOCK_BILLING_ENTITIES
} from '@/lib/data/mockData';
import { MOQService, RetailerService } from '@/lib/services';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface AppContextType {
  // Role & Authentication simulation
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentRetailer: Retailer | null;
  setCurrentRetailer: (retailer: Retailer | null) => void;
  switchRetailerPreset: (presetId: 'approved' | 'pending' | 'info_required' | 'suspended') => void;

  // Cart
  cart: Cart;
  addToCart: (product: Product, sets?: number) => void;
  updateCartItemSets: (productId: string, sets: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  moqEvaluation: MOQEvaluation | null;
  isEvaluatingMoq: boolean;

  // Seller / Below MOQ modal
  isSellerModalOpen: boolean;
  openSellerModal: () => void;
  closeSellerModal: () => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // Global demo quick actions
  toggleAdminMoqOverride: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_CART_ITEMS: CartItem[] = [
  // Seed with 1 product from Entity A and 1 from Entity B to showcase dual-entity GST and MOQ
  {
    productId: 'prod-101',
    product: {
      id: 'prod-101',
      name: 'Kashvi Chanderi Silk Zari 3-Pc Suit Set',
      slug: 'kashvi-chanderi-silk-zari-3-pc-suit-set',
      sku: 'IC-CH-4091',
      designNumber: 'D-8012',
      categoryId: 'cat-5',
      categoryName: 'Pure Chanderi Silk 3-Pc Festive Suits',
      subcategory: 'Zari Woven',
      description: 'Handcrafted pure Chanderi silk kurti featuring authentic woven zari motifs.',
      fabric: 'Pure Chanderi Silk (Top), Chanderi Silk (Bottom), Organza (Dupatta)',
      workType: 'Zari Weaving & Hand Katha Highlights',
      style: 'Straight Cut Kurti with Cigarette Pant & Cutwork Dupatta',
      clothingType: '3_piece',
      piecesPerSet: 4,
      wholesalePricePerPiece: 840,
      wholesalePricePerSet: 3360,
      availableSets: 18,
      totalAvailablePieces: 72,
      sizeCombination: 'M(38), L(40), XL(42), XXL(44)',
      sizes: ['M', 'L', 'XL', 'XXL'],
      colors: ['Wine Red', 'Teal Green'],
      collectionName: 'Virasat Festive 2026',
      billingEntityId: 'entity_a',
      hsn: '621142',
      gstRate: 5,
      status: 'available',
      isNewArrival: true,
      isFeatured: true,
      media: [
        {
          id: 'm-101-1',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&auto=format&fit=crop&q=80',
          alt: 'Kashvi Chanderi Silk 3-Pc Suit',
          isPrimary: true
        }
      ],
      createdAt: '2026-08-10T10:00:00Z'
    },
    selectedSets: 2,
    piecesPerSet: 4,
    totalPieces: 8,
    unitPrice: 840,
    setPrice: 3360,
    lineSubtotal: 6720,
    billingEntityId: 'entity_a'
  },
  {
    productId: 'prod-102',
    product: {
      id: 'prod-102',
      name: 'Jaipuri Bagru Handblock Pure Cotton 2-Pc Set',
      slug: 'jaipuri-bagru-handblock-pure-cotton-2-pc-set',
      sku: 'IC-CT-2084',
      designNumber: 'D-3140',
      categoryId: 'cat-6',
      categoryName: 'Daily Wear Pure Cotton 2-Pc Sets',
      subcategory: 'Bagru Prints',
      description: 'Authentic 60x60 Jaipuri cambric cotton straight kurti with wooden button detailing.',
      fabric: '100% 60x60 Cambric Pure Cotton',
      workType: 'Traditional Hand Wooden Block Print',
      style: 'Straight Kurti with Ankle Length Pant',
      clothingType: '2_piece',
      piecesPerSet: 5,
      wholesalePricePerPiece: 420,
      wholesalePricePerSet: 2100,
      availableSets: 35,
      totalAvailablePieces: 175,
      sizeCombination: 'S(36), M(38), L(40), XL(42), XXL(44)',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Indigo Blue', 'Rust Maroon'],
      collectionName: 'Dabu Sanganer Daily 2026',
      billingEntityId: 'entity_b',
      hsn: '621142',
      gstRate: 5,
      status: 'available',
      isNewArrival: false,
      isFeatured: true,
      media: [
        {
          id: 'm-102-1',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=900&auto=format&fit=crop&q=80',
          alt: 'Jaipuri Cotton Kurti Pant Set',
          isPrimary: true
        }
      ],
      createdAt: '2026-08-12T14:30:00Z'
    },
    selectedSets: 2,
    piecesPerSet: 5,
    totalPieces: 10,
    unitPrice: 420,
    setPrice: 2100,
    lineSubtotal: 4200,
    billingEntityId: 'entity_b'
  }
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedRole = localStorage.getItem('iccha_current_role') as UserRole;
        if (savedRole) return savedRole;
      } catch {
        // ignore
      }
    }
    return 'public';
  });

  const [currentRetailer, setCurrentRetailerState] = useState<Retailer | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedRetailer = localStorage.getItem('iccha_active_retailer');
        if (savedRetailer) return JSON.parse(savedRetailer);
      } catch {
        // ignore
      }
    }
    return MOCK_RETAILERS[0];
  });

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCart = localStorage.getItem('iccha_cart_items');
        if (savedCart) return JSON.parse(savedCart);
      } catch {
        // ignore
      }
    }
    return INITIAL_CART_ITEMS;
  });

  const [moqEvaluation, setMoqEvaluation] = useState<MOQEvaluation | null>(null);
  const [isEvaluatingMoq, setIsEvaluatingMoq] = useState<boolean>(false);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    try {
      localStorage.setItem('iccha_current_role', newRole);
    } catch {
      // ignore
    }
  };

  const setCurrentRetailer = (retailer: Retailer | null) => {
    setCurrentRetailerState(retailer);
    try {
      if (retailer) {
        localStorage.setItem('iccha_active_retailer', JSON.stringify(retailer));
      } else {
        localStorage.removeItem('iccha_active_retailer');
      }
    } catch {
      // ignore
    }
  };

  const switchRetailerPreset = (presetId: 'approved' | 'pending' | 'info_required' | 'suspended') => {
    let target = MOCK_RETAILERS[0]; // approved
    if (presetId === 'pending') target = MOCK_RETAILERS[1];
    else if (presetId === 'info_required') target = MOCK_RETAILERS[2];
    else if (presetId === 'suspended') target = MOCK_RETAILERS[3];

    setCurrentRetailer(target);
    setRole('retailer');
    addToast({
      type: 'info',
      title: `Switched Demo Retailer`,
      message: `Active user: ${target.businessName} (${target.status.toUpperCase().replace('_', ' ')})`
    });
  };

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString().slice(-4)}`;
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Recalculate MOQ whenever cart items or retailer changes
  useEffect(() => {
    let isMounted = true;
    const runEvaluation = async () => {
      setIsEvaluatingMoq(true);
      const evalResult = await MOQService.evaluateCart(cartItems, currentRetailer);
      if (isMounted) {
        setMoqEvaluation(evalResult);
        setIsEvaluatingMoq(false);
      }
    };
    runEvaluation();
    return () => {
      isMounted = false;
    };
  }, [cartItems, currentRetailer]);

  // Compute Cart Summary & Two GST Entity Breakdowns
  const buildCartSummary = useCallback((): Cart => {
    const totalDesigns = cartItems.length;
    const totalSets = cartItems.reduce((acc, item) => acc + item.selectedSets, 0);
    const totalPieces = cartItems.reduce((acc, item) => acc + item.totalPieces, 0);
    const subtotal = cartItems.reduce((acc, item) => acc + item.lineSubtotal, 0);

    // Entity groupings
    const entityIds = Array.from(new Set(cartItems.map(i => i.billingEntityId))) as ('entity_a' | 'entity_b')[];
    
    const entitySummaries: EntityCartSummary[] = entityIds.map(entId => {
      const entity = MOCK_BILLING_ENTITIES.find(e => e.id === entId) || MOCK_BILLING_ENTITIES[0];
      const items = cartItems.filter(i => i.billingEntityId === entId);
      const entSets = items.reduce((acc, i) => acc + i.selectedSets, 0);
      const entPieces = items.reduce((acc, i) => acc + i.totalPieces, 0);
      const entSubtotal = items.reduce((acc, i) => acc + i.lineSubtotal, 0);
      const entGst = items.reduce((acc, i) => acc + Math.round((i.lineSubtotal * i.product.gstRate) / 100), 0);
      const entShipping = cartItems.length > 0 ? (subtotal > 20000 ? 0 : 350) : 0;

      const isInterState = currentRetailer?.address?.stateCode !== entity.stateCode;
      const cgst = isInterState ? 0 : Math.round(entGst / 2);
      const sgst = isInterState ? 0 : Math.round(entGst / 2);
      const igst = isInterState ? entGst : 0;

      return {
        entityId: entId,
        entity,
        items,
        totalSets: entSets,
        totalPieces: entPieces,
        subtotal: entSubtotal,
        cgst,
        sgst,
        igst,
        totalGst: entGst,
        shipping: entShipping,
        total: entSubtotal + entGst + entShipping
      };
    });

    const estimatedGst = entitySummaries.reduce((acc, e) => acc + e.totalGst, 0);
    const shippingEstimate = entitySummaries.reduce((acc, e) => acc + e.shipping, 0);
    const estimatedTotal = subtotal + estimatedGst + shippingEstimate;

    return {
      items: cartItems,
      totalDesigns,
      totalSets,
      totalPieces,
      subtotal,
      estimatedGst,
      shippingEstimate,
      estimatedTotal,
      entitySummaries
    };
  }, [cartItems, currentRetailer]);

  const cart = buildCartSummary();

  const persistCart = (newItems: CartItem[]) => {
    setCartItems(newItems);
    try {
      localStorage.setItem('iccha_cart_items', JSON.stringify(newItems));
    } catch {
      // ignore
    }
  };

  const addToCart = (product: Product, sets = 1) => {
    const existingIdx = cartItems.findIndex(i => i.productId === product.id);
    let updated: CartItem[];

    if (existingIdx >= 0) {
      updated = [...cartItems];
      const newSets = Math.min(product.availableSets, updated[existingIdx].selectedSets + sets);
      updated[existingIdx] = {
        ...updated[existingIdx],
        selectedSets: newSets,
        totalPieces: newSets * product.piecesPerSet,
        lineSubtotal: newSets * product.wholesalePricePerSet
      };
    } else {
      const initialSets = Math.min(product.availableSets, Math.max(1, sets));
      const newItem: CartItem = {
        productId: product.id,
        product,
        selectedSets: initialSets,
        piecesPerSet: product.piecesPerSet,
        totalPieces: initialSets * product.piecesPerSet,
        unitPrice: product.wholesalePricePerPiece,
        setPrice: product.wholesalePricePerSet,
        lineSubtotal: initialSets * product.wholesalePricePerSet,
        billingEntityId: product.billingEntityId
      };
      updated = [newItem, ...cartItems];
    }

    persistCart(updated);
    addToast({
      type: 'success',
      title: 'Added to Wholesale Cart',
      message: `${sets} Set${sets > 1 ? 's' : ''} (${sets * product.piecesPerSet} pcs) of ${product.name} added.`
    });
  };

  const updateCartItemSets = (productId: string, sets: number) => {
    if (sets <= 0) {
      removeFromCart(productId);
      return;
    }
    const updated = cartItems.map(item => {
      if (item.productId === productId) {
        const clampedSets = Math.min(item.product.availableSets, sets);
        return {
          ...item,
          selectedSets: clampedSets,
          totalPieces: clampedSets * item.piecesPerSet,
          lineSubtotal: clampedSets * item.setPrice
        };
      }
      return item;
    });
    persistCart(updated);
  };

  const removeFromCart = (productId: string) => {
    const updated = cartItems.filter(i => i.productId !== productId);
    persistCart(updated);
    addToast({
      type: 'info',
      title: 'Removed Item',
      message: 'Product lot removed from wholesale cart.'
    });
  };

  const clearCart = () => {
    persistCart([]);
  };

  const openSellerModal = () => setIsSellerModalOpen(true);
  const closeSellerModal = () => setIsSellerModalOpen(false);

  const toggleAdminMoqOverride = async () => {
    if (!currentRetailer) return;
    const newOverride = !currentRetailer.moqOverride;
    await RetailerService.setMoqOverride(currentRetailer.id, newOverride, 1);
    const updated = { ...currentRetailer, moqOverride: newOverride, customMoqSets: 1 };
    setCurrentRetailer(updated);
    addToast({
      type: newOverride ? 'success' : 'warning',
      title: `MOQ Override ${newOverride ? 'Activated' : 'Removed'}`,
      message: newOverride
        ? `Retailer ${currentRetailer.businessName} now has below-MOQ checkout unlocked!`
        : `Default MOQ requirements restored.`
    });
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        currentRetailer,
        setCurrentRetailer,
        switchRetailerPreset,
        cart,
        addToCart,
        updateCartItemSets,
        removeFromCart,
        clearCart,
        moqEvaluation,
        isEvaluatingMoq,
        isSellerModalOpen,
        openSellerModal,
        closeSellerModal,
        toasts,
        addToast,
        removeToast,
        toggleAdminMoqOverride
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
