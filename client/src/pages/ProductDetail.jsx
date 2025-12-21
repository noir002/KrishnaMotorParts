import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import productService from '../services/productService';
import { useCart } from '../context/CartContext';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { useLoading } from '../hooks/useLoading';
import { useToast } from '../components/common/ToastContainer';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ImageGallery from '../components/product/ImageGallery';
import ProductSpecifications from '../components/product/ProductSpecifications';
import RelatedProducts from '../components/product/RelatedProducts';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { handleApiResponse } = useErrorHandler();
  const { loading, withLoading } = useLoading(true);
  const { showSuccess } = useToast();
  
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      await withLoading(async () => {
        setError(null);

        try {
          const response = await productService.getProduct(id);
          const result = handleApiResponse(response, 'fetching product');
          
          if (result.success) {
            setProduct(result.data);
          } else {
            if (result.status === 404) {
              setError('Product not found');
            } else {
              setError(result.error);
            }
          }
        } catch (err) {
          console.error('Error fetching product:', err);
          setError('Failed to load product');
        }
      });
    };

    fetchProduct();
  }, [id, withLoading, handleApiResponse]);

  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    const result = await addToCart(product, quantity);
    
    if (result.success) {
      showSuccess(`${product.name} added to cart!`);
    }
    
    setAddingToCart(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#efeff2] dark:bg-slate-900 pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#efeff2] dark:bg-slate-900 pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="neu-flat p-12 text-center">
            <span className="material-symbols-outlined text-8xl text-red-500 mb-4">
              error
            </span>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">
              {error}
            </h1>
            <Button onClick={() => navigate('/products')} variant="primary">
              Back to Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const isOutOfStock = !product.stock?.inStock || product.stock?.quantity <= 0;
  const maxQuantity = Math.min(product.stock?.quantity || 0, 10);

  return (
    <div className="min-h-screen bg-[#efeff2] dark:bg-slate-900 pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span className="material-symbols-outlined text-xs">
              chevron_right
            </span>
            <Link to="/products" className="hover:text-primary transition-colors">
              Products
            </Link>
            <span className="material-symbols-outlined text-xs">
              chevron_right
            </span>
            {product.category && (
              <>
                <span className="hover:text-primary transition-colors">
                  {product.category.name || product.category}
                </span>
                <span className="material-symbols-outlined text-xs">
                  chevron_right
                </span>
              </>
            )}
            <span className="text-slate-800 dark:text-white font-medium">
              {product.name}
            </span>
          </div>
        </nav>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div>
            <ImageGallery images={product.images} productName={product.name} />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category and Brand */}
            <div className="flex items-center gap-4 text-sm">
              {product.category && (
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                  {product.subcategory || product.category.name || product.category}
                </span>
              )}
              {product.brand && (
                <span className="text-slate-600 dark:text-slate-300">
                  Brand: <span className="font-medium">{product.brand}</span>
                </span>
              )}
            </div>

            {/* Product Name */}
            <h1 className="text-3xl lg:text-4xl font-black text-slate-800 dark:text-white">
              {product.name}
            </h1>

            {/* Part Number */}
            {product.partNumber && (
              <p className="text-slate-600 dark:text-slate-300">
                Part Number: <span className="font-mono font-medium">{product.partNumber}</span>
              </p>
            )}

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(product.discountPrice || product.price)}
              </span>
              {product.discountPrice && product.discountPrice < product.price && (
                <>
                  <span className="text-xl text-slate-500 dark:text-slate-400 line-through">
                    {formatPrice(product.price)}
                  </span>
                  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                    {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">
                inventory
              </span>
              {isOutOfStock ? (
                <span className="text-red-500 font-medium">Out of Stock</span>
              ) : product.stock?.quantity <= 5 ? (
                <span className="text-orange-500 font-medium">
                  Only {product.stock.quantity} left in stock
                </span>
              ) : (
                <span className="text-green-500 font-medium">In Stock</span>
              )}
            </div>

            {/* Quick Compatibility */}
            {product.compatibility && product.compatibility.length > 0 && (
              <div className="neu-pressed p-4 rounded-lg">
                <h3 className="font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined">
                    directions_car
                  </span>
                  Compatible Vehicles
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.compatibility.slice(0, 3).map((vehicle, index) => (
                    <span key={index} className="bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-full text-sm">
                      {vehicle.make} {vehicle.model} {vehicle.year && `(${vehicle.year})`}
                    </span>
                  ))}
                  {product.compatibility.length > 3 && (
                    <span className="text-slate-600 dark:text-slate-300 text-sm">
                      +{product.compatibility.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            {!isOutOfStock && (
              <div className="neu-flat p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <label className="font-medium text-slate-800 dark:text-white">
                    Quantity:
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="neu-btn w-10 h-10 flex items-center justify-center disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined">remove</span>
                    </button>
                    <span className="w-12 text-center font-bold text-slate-800 dark:text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                      disabled={quantity >= maxQuantity}
                      className="neu-btn w-10 h-10 flex items-center justify-center disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    (Max: {maxQuantity})
                  </span>
                </div>

                <Button
                  variant="primary"
                  size="large"
                  onClick={handleAddToCart}
                  loading={addingToCart}
                  className="w-full"
                >
                  <span className="material-symbols-outlined">
                    shopping_cart
                  </span>
                  Add to Cart - {formatPrice((product.discountPrice || product.price) * quantity)}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="neu-flat p-6 mb-12">
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
            {[
              { id: 'description', label: 'Description', icon: 'description' },
              { id: 'specifications', label: 'Specifications', icon: 'engineering' },
              { id: 'compatibility', label: 'Compatibility', icon: 'directions_car' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-slate-600 dark:text-slate-300 hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[200px]">
            {activeTab === 'description' && (
              <div className="prose dark:prose-invert max-w-none">
                {product.description ? (
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {product.description}
                  </p>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400 italic">
                    No description available for this product.
                  </p>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <ProductSpecifications 
                specifications={product.specifications}
                compatibility={product.compatibility}
              />
            )}

            {activeTab === 'compatibility' && (
              <div>
                {product.compatibility && product.compatibility.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {product.compatibility.map((vehicle, index) => (
                      <div key={index} className="neu-pressed p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="material-symbols-outlined text-primary">
                            directions_car
                          </span>
                          <span className="font-bold text-slate-800 dark:text-white">
                            {vehicle.make}
                          </span>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                          <div><span className="font-medium">Model:</span> {vehicle.model}</div>
                          {vehicle.year && (
                            <div><span className="font-medium">Year:</span> {vehicle.year}</div>
                          )}
                          {vehicle.variant && (
                            <div><span className="font-medium">Variant:</span> {vehicle.variant}</div>
                          )}
                          {vehicle.engine && (
                            <div><span className="font-medium">Engine:</span> {vehicle.engine}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400 italic text-center py-8">
                    No compatibility information available.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <RelatedProducts
          productId={product._id}
          category={product.category}
          brand={product.brand}
          compatibility={product.compatibility}
        />
      </div>
    </div>
  );
};

export default ProductDetail;