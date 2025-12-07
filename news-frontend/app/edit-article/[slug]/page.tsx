'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { newsAPI } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Save, Eye, Upload, X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface ArticleData {
  title: string;
  summary: string;
  content: string;
  category: string;
  tags: string;
  status: 'draft' | 'published';
  is_featured: boolean;
}

export default function EditArticlePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [articleLoading, setArticleLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<ArticleData>({
    title: '',
    summary: '',
    content: '',
    category: '',
    tags: '',
    status: 'draft',
    is_featured: false,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (user && params.slug) {
      fetchCategories();
      fetchArticle();
    }
  }, [user, authLoading, params.slug]);

  const fetchCategories = async () => {
    try {
      const response = await newsAPI.getCategories();
      // Handle paginated response
      setCategories(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchArticle = async () => {
    try {
      const response = await newsAPI.getArticle(params.slug);
      const article = response.data;
      
      // Format tags for the input field
      const tagsString = article.tags.map((tag: any) => tag.name).join(', ');
      
      setFormData({
        title: article.title,
        summary: article.summary,
        content: article.content,
        category: article.category?.id || '',
        tags: tagsString,
        status: article.status,
        is_featured: article.is_featured,
      });
      
      // Set existing image URL if available
      if (article.featured_image) {
        setExistingImageUrl(article.featured_image);
        setImagePreview(article.featured_image);
      }
    } catch (error: any) {
      toast.error('Failed to load article');
      router.push('/my-articles');
    } finally {
      setArticleLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setImageFile(file);
      setExistingImageUrl(null); // Clear existing image URL
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setExistingImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'published') => {
    e.preventDefault();
    setLoading(true);

    const tagsArray = formData.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    // Create FormData object for file upload
    const formDataObj = new FormData();
    formDataObj.append('title', formData.title);
    formDataObj.append('summary', formData.summary);
    formDataObj.append('content', formData.content);
    formDataObj.append('status', status);
    formDataObj.append('is_featured', formData.is_featured.toString());
    
    if (formData.category) {
      formDataObj.append('category', formData.category);
    }
    
    if (tagsArray.length > 0) {
      tagsArray.forEach((tag, index) => {
        formDataObj.append(`tags[${index}]`, tag);
      });
    }
    
    // Only append image if a new file is selected
    if (imageFile) {
      formDataObj.append('featured_image', imageFile);
    } else if (existingImageUrl === null && imagePreview === null) {
      // If user removed the existing image, send empty string to clear it
      formDataObj.append('featured_image', '');
    }

    try {
      const response = await newsAPI.updateArticle(params.slug, formDataObj);
      toast.success(response.data.message);
      router.push(`/article/${response.data.article.slug}`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join(', ')
        : error.response?.data?.message || 'Failed to update article';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || articleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Edit Article</h1>
            <p className="text-gray-800">Update your article content</p>
          </div>

          {/* Form */}
          <form className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-900 mb-2">
                Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                className="input"
                placeholder="Enter article title (min 10 characters)"
              />
            </div>

            {/* Summary */}
            <div>
              <label htmlFor="summary" className="block text-sm font-medium text-gray-900 mb-2">
                Summary *
              </label>
              <textarea
                id="summary"
                name="summary"
                required
                value={formData.summary}
                onChange={handleChange}
                rows={3}
                className="input resize-none"
                placeholder="Brief summary of your article (min 20 characters)"
              />
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-900 mb-2">
                Content *
              </label>
              <textarea
                id="content"
                name="content"
                required
                value={formData.content}
                onChange={handleChange}
                rows={15}
                className="input resize-none"
                placeholder="Write your article content here (min 100 characters)"
              />
              <p className="mt-1 text-sm text-gray-700">
                {formData.content.length} characters
              </p>
            </div>

            {/* Category & Tags Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-900 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-900 mb-2">
                  Tags
                </label>
                <input
                  id="tags"
                  name="tags"
                  type="text"
                  value={formData.tags}
                  onChange={handleChange}
                  className="input"
                  placeholder="django, python, api (comma separated)"
                />
              </div>
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Featured Image
              </label>
              
              {imagePreview ? (
                <div className="relative inline-block">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Featured Checkbox */}
            <div className="flex items-center">
              <input
                id="is_featured"
                name="is_featured"
                type="checkbox"
                checked={formData.is_featured}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-900">
                Mark as featured article
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={(e) => handleSubmit(e, 'draft')}
                disabled={loading}
                className="btn btn-secondary flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                <span>Save as Draft</span>
              </button>

              <button
                type="button"
                onClick={(e) => handleSubmit(e, 'published')}
                disabled={loading}
                className="btn btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Eye className="w-5 h-5" />
                <span>Update Article</span>
              </button>

              {loading && (
                <div className="flex items-center text-gray-800">
                  <div className="spinner w-5 h-5 border-2 mr-2"></div>
                  <span>Updating article...</span>
                </div>
              )}
            </div>
          </form>

          {/* Help Text */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Tips for editing articles:</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Review your content carefully before publishing</li>
              <li>Update tags to reflect any changes in content</li>
              <li>Consider updating the featured image if the content has changed significantly</li>
              <li>Save as draft first to review changes before publishing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}