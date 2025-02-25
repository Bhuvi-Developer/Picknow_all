import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { categoryApi } from '../../APi/categoryApi';
import { productApi } from '../../APi/productApi';
import './CategoryNav.css';
import { useSnackbar } from 'notistack';

const CategoryNav = () => {
  const [categories, setCategories] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredSubCategory, setHoveredSubCategory] = useState(null);
  const [subCategories, setSubCategories] = useState({});
  const [nestedSubCategories, setNestedSubCategories] = useState({});
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Fetch all categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAllCategories();
        setCategories(response);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch subcategories when hovering over a category
  useEffect(() => {
    if (hoveredCategory) {
      const fetchSubCategories = async () => {
        try {
          const response = await categoryApi.getSubCategories(hoveredCategory._id);
          setSubCategories(prev => ({
            ...prev,
            [hoveredCategory._id]: response.subCategories
          }));

          // Fetch nested subcategories for each subcategory
          response.subCategories.forEach(async (subCategory) => {
            const nestedResponse = await categoryApi.getNestedSubCategories(
              hoveredCategory._id,
              subCategory._id
            );
            setNestedSubCategories(prev => ({
              ...prev,
              [subCategory._id]: nestedResponse.subCategories
            }));
          });
        } catch (error) {
          console.error('Error fetching categories:', error);
        }
      };
      fetchSubCategories();
    }
  }, [hoveredCategory]);

  const handleCategoryClick = (category) => {
    navigate(`/category/${category._id}`);
  };

  const handleNestedSubCategoryClick = async (nestedSubCategory, event) => {
    event.preventDefault();
    try {
      console.log('Clicking nested subcategory:', {
        id: nestedSubCategory._id,
        name: nestedSubCategory.name,
        fullObject: nestedSubCategory
      });

      const response = await productApi.getProductsByNestedSubCategory(nestedSubCategory._id);
      console.log('API Response:', {
        success: response.success,
        productsCount: response.products?.length,
        debug: response.debug,
        fullResponse: response
      });

      if (response.success && Array.isArray(response.products)) {
        if (response.products.length === 0) {
          enqueueSnackbar(`No products found in ${nestedSubCategory.name}`, { 
            variant: 'info' 
          });
        } else {
          console.log('Navigating with products:', response.products);
          navigate('/product', { 
            state: { 
              products: response.products, 
              title: `Products in ${nestedSubCategory.name}` 
            } 
          });
        }
      } else {
        console.error('Invalid response format:', response);
        enqueueSnackbar('Error loading products', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error fetching nested subcategory products:', error);
      enqueueSnackbar('Error fetching products', { variant: 'error' });
    }
  };

  return (
    <nav className="category-nav">
      <ul className="nav-list">
        {categories.map((category) => (
          <li
            key={category._id}
            className="nav-item"
            onMouseEnter={() => setHoveredCategory(category)}
            onMouseLeave={() => {
              setHoveredCategory(null);
              setHoveredSubCategory(null);
            }}
          >
            <button className="category-button">
              <span>{category.cName}</span>
            </button>
            
            {/* Subcategories dropdown */}
            {hoveredCategory === category && subCategories[category._id]?.length > 0 && (
              <div className="mega-dropdown active">
                <div className="mega-dropdown-content">
                  {subCategories[category._id].map((subCategory) => (
                    <div key={subCategory._id} className="category-column">
                      <h3 className="category-title">{subCategory.name}</h3>
                      <ul className="nested-list">
                        {nestedSubCategories[subCategory._id]?.map((nestedSubCategory) => (
                          <li 
                            key={nestedSubCategory._id} 
                            className="nested-item"
                            onClick={(e) => handleNestedSubCategoryClick(nestedSubCategory, e)}
                          >
                            {nestedSubCategory.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default CategoryNav;
