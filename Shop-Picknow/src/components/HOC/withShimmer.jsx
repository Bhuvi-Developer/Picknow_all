import React, { useState, useEffect } from 'react';
import { PAGE_TYPES } from '../../constants/pageTypes';
import { 
  CarouselShimmer, 
  WelcomeShimmer, 
  BestSellingShimmer,
  CategoryShimmer,
  BannerShimmer,
  ProductDetailsShimmer,
  CartShimmer,
  CheckoutShimmer,
  ProfileShimmer 
} from '../ShimmerEffect/ShimmerEffect';

const getShimmerByPageType = (pageType) => {
  switch (pageType) {
    case PAGE_TYPES.LANDING:
      return (
        <>
          <CarouselShimmer />
          <WelcomeShimmer />
          <CategoryShimmer />
          <BannerShimmer />
          <BestSellingShimmer />
        </>
      );
    case PAGE_TYPES.PRODUCT:
      return <ProductDetailsShimmer />;
    case PAGE_TYPES.CART:
      return <CartShimmer />;
    case PAGE_TYPES.CHECKOUT:
      return <CheckoutShimmer />;
    case PAGE_TYPES.PROFILE:
      return <ProfileShimmer />;
    case PAGE_TYPES.CATEGORY:
      return (
        <>
          <CategoryShimmer />
          <BestSellingShimmer />
        </>
      );
    case PAGE_TYPES.SEARCH:
    case PAGE_TYPES.WISHLIST:
      return <BestSellingShimmer />;
    case PAGE_TYPES.ORDER:
      return <CartShimmer />;
    case PAGE_TYPES.BANNER:
      return <BannerShimmer />;
    case PAGE_TYPES.CATEGORY_SLIDER:
      return <CategoryShimmer />;
    case PAGE_TYPES.PRODUCT_DETAIL:
      return <ProductDetailsShimmer />;
    default:
      return <BestSellingShimmer />;
  }
};

const withShimmer = (WrappedComponent, pageType = PAGE_TYPES.LANDING, delay = 500) => {
  return function WithShimmerComponent(props) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const timer = setTimeout(() => {
        setLoading(false);
      }, delay);

      return () => clearTimeout(timer); // Cleanup function to prevent memory leaks
    }, [delay]);

    if (loading) {
      return (
        <div className="page-shimmer">
          {getShimmerByPageType(pageType)}
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
};

// Export both the HOC and PAGE_TYPES
export default withShimmer;
