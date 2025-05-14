import { 
  Brand, InsertBrand, 
  Category, InsertCategory, 
  Color, InsertColor, 
  Size, InsertSize, 
  Product, InsertProduct, 
  ProductFilters
} from "@shared/schema";

import { 
  User, InsertUser,
  Wishlist, InsertWishlist,
  WishlistItem, InsertWishlistItem,
  PriceAlert, InsertPriceAlert,
  ApiSyncLog
} from "@shared/schema";

export interface IStorage {
  // Brands
  getBrands(): Promise<Brand[]>;
  getBrandById(id: number): Promise<Brand | undefined>;
  getBrandByName(name: string): Promise<Brand | undefined>;
  createBrand(brand: InsertBrand): Promise<Brand>;
  updateBrand(id: number, brand: Partial<InsertBrand>): Promise<Brand>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  getCategoryByName(name: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Colors
  getColors(): Promise<Color[]>;
  getColorById(id: number): Promise<Color | undefined>;
  createColor(color: InsertColor): Promise<Color>;

  // Sizes
  getSizes(): Promise<Size[]>;
  getSizeById(id: number): Promise<Size | undefined>;
  createSize(size: InsertSize): Promise<Size>;

  // Products
  getProducts(filters?: ProductFilters): Promise<{ products: Product[], total: number }>;
  getProductById(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  
  // Location-specific methods
  getUKProducts(filters?: ProductFilters): Promise<{ products: Product[], total: number }>;
  
  // User management
  getUser(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, userData: Partial<InsertUser>): Promise<User>;
  
  // Wishlist management
  getWishlists(userId: string): Promise<Wishlist[]>;
  getWishlistById(id: number): Promise<Wishlist | undefined>;
  createWishlist(wishlist: InsertWishlist): Promise<Wishlist>;
  updateWishlist(id: number, wishlist: Partial<InsertWishlist>): Promise<Wishlist>;
  deleteWishlist(id: number): Promise<void>;
  
  // Wishlist items
  getWishlistItems(wishlistId: number): Promise<WishlistItem[]>;
  addToWishlist(item: InsertWishlistItem): Promise<WishlistItem>;
  removeFromWishlist(wishlistId: number, productId: number): Promise<void>;
  
  // Price alerts
  getPriceAlerts(userId: string): Promise<PriceAlert[]>;
  getPriceAlertById(id: number): Promise<PriceAlert | undefined>;
  createPriceAlert(alert: InsertPriceAlert): Promise<PriceAlert>;
  updatePriceAlert(id: number, alert: Partial<InsertPriceAlert>): Promise<PriceAlert>;
  deletePriceAlert(id: number): Promise<void>;
  
  // API integration
  logApiSync(brandId: number): Promise<ApiSyncLog>;
  updateApiSyncLog(id: number, log: Partial<ApiSyncLog>): Promise<ApiSyncLog>;
  getLatestApiSyncLog(brandId: number): Promise<ApiSyncLog | undefined>;
}

export class MemStorage implements IStorage {
  private brands: Map<number, Brand>;
  private categories: Map<number, Category>;
  private colors: Map<number, Color>;
  private sizes: Map<number, Size>;
  private products: Map<number, Product>;
  private users: Map<string, User>;
  private wishlists: Map<number, Wishlist>;
  private wishlistItems: Map<number, WishlistItem>;
  private priceAlerts: Map<number, PriceAlert>;
  private apiSyncLogs: Map<number, ApiSyncLog>;
  
  private brandId: number;
  private categoryId: number;
  private colorId: number;
  private sizeId: number;
  private productId: number;
  private wishlistId: number;
  private wishlistItemId: number;
  private priceAlertId: number;
  private apiSyncLogId: number;

  constructor() {
    this.brands = new Map();
    this.categories = new Map();
    this.colors = new Map();
    this.sizes = new Map();
    this.products = new Map();
    this.users = new Map();
    this.wishlists = new Map();
    this.wishlistItems = new Map();
    this.priceAlerts = new Map();
    this.apiSyncLogs = new Map();
    
    this.brandId = 1;
    this.categoryId = 1;
    this.colorId = 1;
    this.sizeId = 1;
    this.productId = 1;
    this.wishlistId = 1;
    this.wishlistItemId = 1;
    this.priceAlertId = 1;
    this.apiSyncLogId = 1;
    
    this.initializeData();
  }

  private initializeData(): void {
    // Initialize Brands
    const brands = [
      { name: "Zara", logo: "SiZara", website: "https://www.zara.com" },
      { name: "H&M", logo: "SiHm", website: "https://www.hm.com" },
      { name: "Primark", logo: "SiPrimark", website: "https://www.primark.com" },
      { name: "Nike", logo: "SiNike", website: "https://www.nike.com" },
      { name: "Adidas", logo: "SiAdidas", website: "https://www.adidas.com" },
      { name: "Mango", logo: "SiMango", website: "https://www.mango.com" }
    ];
    
    brands.forEach(brand => this.createBrand(brand));

    // Initialize Categories
    const categories = [
      { name: "T-shirts" },
      { name: "Dresses" },
      { name: "Jeans" },
      { name: "Pants" },
      { name: "Jackets" },
      { name: "Skirts" },
      { name: "Sweaters" },
      { name: "Shirts" }
    ];
    
    categories.forEach(category => this.createCategory(category));

    // Initialize Colors
    const colors = [
      { name: "Black", hexCode: "#000000" },
      { name: "White", hexCode: "#FFFFFF" },
      { name: "Red", hexCode: "#FF0000" },
      { name: "Blue", hexCode: "#0000FF" },
      { name: "Green", hexCode: "#00FF00" },
      { name: "Yellow", hexCode: "#FFFF00" },
      { name: "Purple", hexCode: "#800080" },
      { name: "Pink", hexCode: "#FFC0CB" }
    ];
    
    colors.forEach(color => this.createColor(color));

    // Initialize Sizes
    const sizes = [
      { name: "XS" },
      { name: "S" },
      { name: "M" },
      { name: "L" },
      { name: "XL" },
      { name: "XXL" }
    ];
    
    sizes.forEach(size => this.createSize(size));

    // Initialize Products
    const products = [
      {
        name: "Basic White T-shirt",
        description: "Premium quality cotton t-shirt with a classic fit.",
        price: 29.99,
        brandId: 1, // Zara
        categoryId: 1, // T-shirts
        images: [
          "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000",
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000"
        ],
        rating: 4.8,
        reviewCount: 120,
        inStock: true,
        isNew: true,
        sizes: [1, 2, 3, 4, 5], // XS, S, M, L, XL
        colors: [1, 2], // Black, White
        url: "https://www.zara.com/basic-white-tshirt"
      },
      {
        name: "Summer Blue Dress",
        description: "Flowy summer dress with a beautiful blue pattern.",
        price: 39.99,
        discountedPrice: 49.99,
        brandId: 2, // H&M
        categoryId: 2, // Dresses
        images: [
          "https://images.unsplash.com/photo-1623609163841-5e69d8c62cc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000",
          "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000"
        ],
        rating: 4.6,
        reviewCount: 85,
        inStock: true,
        isNew: false,
        sizes: [2, 3, 4], // S, M, L
        colors: [4], // Blue
        url: "https://www.hm.com/summer-blue-dress"
      },
      {
        name: "Leather Biker Jacket",
        description: "Premium quality leather jacket with a classic biker design. Features zippered pockets and adjustable waist belt.",
        price: 89.99,
        brandId: 6, // Mango
        categoryId: 5, // Jackets
        images: [
          "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000",
          "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000"
        ],
        rating: 4.9,
        reviewCount: 122,
        inStock: true,
        isNew: false,
        sizes: [2, 3, 4, 5], // S, M, L, XL
        colors: [1, 2], // Black, White
        url: "https://www.mango.com/leather-biker-jacket"
      },
      {
        name: "Slim Fit Jeans",
        description: "Comfortable slim fit jeans that go with everything.",
        price: 49.99,
        brandId: 1, // Zara
        categoryId: 3, // Jeans
        images: [
          "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000",
          "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000"
        ],
        rating: 4.7,
        reviewCount: 95,
        inStock: true,
        isNew: false,
        sizes: [2, 3, 4, 5, 6], // S, M, L, XL, XXL
        colors: [1, 4], // Black, Blue
        url: "https://www.zara.com/slim-fit-jeans"
      },
      {
        name: "Floral Print Dress",
        description: "Beautiful floral printed dress, perfect for summer occasions.",
        price: 34.99,
        discountedPrice: 41.99,
        brandId: 2, // H&M
        categoryId: 2, // Dresses
        images: [
          "https://images.unsplash.com/photo-1605763240000-7e93b172d754?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000",
          "https://images.unsplash.com/photo-1574634534894-89d7576c8259?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000"
        ],
        rating: 4.5,
        reviewCount: 78,
        inStock: true,
        isNew: false,
        sizes: [1, 2, 3, 4], // XS, S, M, L
        colors: [7, 8], // Purple, Pink
        url: "https://www.hm.com/floral-print-dress"
      },
      {
        name: "Evening Gown",
        description: "Elegant evening gown for special occasions.",
        price: 79.99,
        brandId: 3, // Primark
        categoryId: 2, // Dresses
        images: [
          "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000",
          "https://images.unsplash.com/photo-1571908599407-cdb918ed83bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000"
        ],
        rating: 4.8,
        reviewCount: 112,
        inStock: true,
        isNew: false,
        sizes: [2, 3, 4, 5], // S, M, L, XL
        colors: [1], // Black
        url: "https://www.primark.com/evening-gown"
      },
      {
        name: "Striped Shirt",
        description: "Classic striped shirt, perfect for casual or semi-formal occasions.",
        price: 32.99,
        brandId: 1, // Zara
        categoryId: 8, // Shirts
        images: [
          "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000",
          "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000"
        ],
        rating: 4.6,
        reviewCount: 89,
        inStock: true,
        isNew: true,
        sizes: [1, 2, 3, 4, 5, 6], // XS, S, M, L, XL, XXL
        colors: [2, 4], // White, Blue
        url: "https://www.zara.com/striped-shirt"
      },
      {
        name: "Winter Coat",
        description: "Warm winter coat with insulated lining, perfect for cold weather.",
        price: 129.99,
        brandId: 6, // Mango
        categoryId: 5, // Jackets
        images: [
          "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000",
          "https://images.unsplash.com/photo-1544923246-77307dd654cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000"
        ],
        rating: 4.9,
        reviewCount: 134,
        inStock: true,
        isNew: false,
        sizes: [2, 3, 4, 5], // S, M, L, XL
        colors: [1, 3, 4], // Black, Red, Blue
        url: "https://www.mango.com/winter-coat"
      }
    ];
    
    products.forEach(product => this.createProduct(product));
  }

  // Brand methods
  async getBrands(): Promise<Brand[]> {
    return Array.from(this.brands.values());
  }

  async getBrandById(id: number): Promise<Brand | undefined> {
    return this.brands.get(id);
  }

  async getBrandByName(name: string): Promise<Brand | undefined> {
    return Array.from(this.brands.values()).find(
      (brand) => brand.name.toLowerCase() === name.toLowerCase()
    );
  }

  async createBrand(brand: InsertBrand): Promise<Brand> {
    const id = this.brandId++;
    const newBrand: Brand = { ...brand, id };
    this.brands.set(id, newBrand);
    return newBrand;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryByName(name: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.name.toLowerCase() === name.toLowerCase()
    );
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  // Color methods
  async getColors(): Promise<Color[]> {
    return Array.from(this.colors.values());
  }

  async getColorById(id: number): Promise<Color | undefined> {
    return this.colors.get(id);
  }

  async createColor(color: InsertColor): Promise<Color> {
    const id = this.colorId++;
    const newColor: Color = { ...color, id };
    this.colors.set(id, newColor);
    return newColor;
  }

  // Size methods
  async getSizes(): Promise<Size[]> {
    return Array.from(this.sizes.values());
  }

  async getSizeById(id: number): Promise<Size | undefined> {
    return this.sizes.get(id);
  }

  async createSize(size: InsertSize): Promise<Size> {
    const id = this.sizeId++;
    const newSize: Size = { ...size, id };
    this.sizes.set(id, newSize);
    return newSize;
  }

  // Product methods
  async getProducts(filters?: ProductFilters): Promise<{ products: Product[], total: number }> {
    let products = Array.from(this.products.values());
    
    if (filters) {
      // Filter by brand
      if (filters.brandIds && filters.brandIds.length > 0) {
        products = products.filter(product => filters.brandIds!.includes(product.brandId));
      }
      
      // Filter by category
      if (filters.categoryIds && filters.categoryIds.length > 0) {
        products = products.filter(product => filters.categoryIds!.includes(product.categoryId));
      }
      
      // Filter by color
      if (filters.colors && filters.colors.length > 0) {
        products = products.filter(product => {
          const productColors = product.colors as number[];
          return filters.colors!.some(colorId => productColors.includes(colorId));
        });
      }
      
      // Filter by size
      if (filters.sizes && filters.sizes.length > 0) {
        products = products.filter(product => {
          const productSizes = product.sizes as number[];
          const sizeIds = filters.sizes!.map(size => {
            const foundSize = Array.from(this.sizes.values()).find(s => s.name === size);
            return foundSize ? foundSize.id : -1;
          }).filter(id => id !== -1);
          
          return sizeIds.some(sizeId => productSizes.includes(sizeId));
        });
      }
      
      // Filter by price range
      if (filters.priceMin !== undefined) {
        products = products.filter(product => 
          (product.discountedPrice || product.price) >= filters.priceMin!
        );
      }
      
      if (filters.priceMax !== undefined) {
        products = products.filter(product => 
          (product.discountedPrice || product.price) <= filters.priceMax!
        );
      }
      
      // Filter by search term
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        products = products.filter(product => {
          const brand = this.brands.get(product.brandId);
          const category = this.categories.get(product.categoryId);
          
          return (
            product.name.toLowerCase().includes(searchTerm) ||
            (product.description && product.description.toLowerCase().includes(searchTerm)) ||
            (brand && brand.name.toLowerCase().includes(searchTerm)) ||
            (category && category.name.toLowerCase().includes(searchTerm))
          );
        });
      }
    }
    
    const total = products.length;
    
    // Pagination
    if (filters && (filters.page !== undefined || filters.limit !== undefined)) {
      const page = filters.page || 1;
      const limit = filters.limit || 12;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      products = products.slice(startIndex, endIndex);
    }
    
    return { products, total };
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const newProduct: Product = { ...product, id };
    this.products.set(id, newProduct);
    return newProduct;
  }
  
  async getUKProducts(filters?: ProductFilters): Promise<{ products: Product[], total: number }> {
    // UK-based brands IDs - Primark, River Island, John Lewis, Next, Matalan, New Look
    const ukBrandIds = [2, 3, 6, 5, 9, 10]; 
    
    // Create a copy of the filters or initialize a new one
    const ukFilters: ProductFilters = filters ? { ...filters } : {};
    
    // Set or merge the UK brand IDs with any existing brand filter
    if (ukFilters.brandIds && ukFilters.brandIds.length > 0) {
      // If specific brands are requested, only include UK brands from that selection
      ukFilters.brandIds = ukFilters.brandIds.filter(id => ukBrandIds.includes(id));
      
      // If no UK brands are in the requested brands, use all UK brands
      if (ukFilters.brandIds.length === 0) {
        ukFilters.brandIds = [...ukBrandIds];
      }
    } else {
      // Use all UK brands if no specific brands are requested
      ukFilters.brandIds = [...ukBrandIds];
    }
    
    // Use the regular getProducts method with the UK filters
    return this.getProducts(ukFilters);
  }
  
  // Implementation of updateBrand method
  async updateBrand(id: number, brandData: Partial<InsertBrand>): Promise<Brand> {
    const existingBrand = await this.getBrandById(id);
    
    if (!existingBrand) {
      throw new Error(`Brand with ID ${id} not found`);
    }
    
    const updatedBrand = { ...existingBrand, ...brandData };
    this.brands.set(id, updatedBrand);
    
    return updatedBrand;
  }
  
  // Implementation of updateProduct method
  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product> {
    const existingProduct = await this.getProductById(id);
    
    if (!existingProduct) {
      throw new Error(`Product with ID ${id} not found`);
    }
    
    const updatedProduct = { ...existingProduct, ...productData };
    this.products.set(id, updatedProduct);
    
    return updatedProduct;
  }
  
  // USER METHODS
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    const now = new Date();
    const user: User = {
      ...userData,
      createdAt: now,
      updatedAt: now
    };
    
    this.users.set(user.id, user);
    return user;
  }
  
  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User> {
    const existingUser = await this.getUser(id);
    
    if (!existingUser) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    const updatedUser: User = {
      ...existingUser,
      ...userData,
      updatedAt: new Date()
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // WISHLIST METHODS
  async getWishlists(userId: string): Promise<Wishlist[]> {
    return Array.from(this.wishlists.values()).filter(
      wishlist => wishlist.userId === userId
    );
  }
  
  async getWishlistById(id: number): Promise<Wishlist | undefined> {
    return this.wishlists.get(id);
  }
  
  async createWishlist(wishlist: InsertWishlist): Promise<Wishlist> {
    const id = this.wishlistId++;
    const now = new Date();
    
    const newWishlist: Wishlist = {
      ...wishlist,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.wishlists.set(id, newWishlist);
    return newWishlist;
  }
  
  async updateWishlist(id: number, wishlistData: Partial<InsertWishlist>): Promise<Wishlist> {
    const existingWishlist = await this.getWishlistById(id);
    
    if (!existingWishlist) {
      throw new Error(`Wishlist with ID ${id} not found`);
    }
    
    const updatedWishlist: Wishlist = {
      ...existingWishlist,
      ...wishlistData,
      updatedAt: new Date()
    };
    
    this.wishlists.set(id, updatedWishlist);
    return updatedWishlist;
  }
  
  async deleteWishlist(id: number): Promise<void> {
    if (!this.wishlists.has(id)) {
      throw new Error(`Wishlist with ID ${id} not found`);
    }
    
    // Delete wishlist
    this.wishlists.delete(id);
    
    // Delete associated wishlist items
    const itemsToDelete = Array.from(this.wishlistItems.values())
      .filter(item => item.wishlistId === id);
      
    for (const item of itemsToDelete) {
      this.wishlistItems.delete(item.id);
    }
  }
  
  // WISHLIST ITEM METHODS
  async getWishlistItems(wishlistId: number): Promise<WishlistItem[]> {
    return Array.from(this.wishlistItems.values()).filter(
      item => item.wishlistId === wishlistId
    );
  }
  
  async addToWishlist(item: InsertWishlistItem): Promise<WishlistItem> {
    const id = this.wishlistItemId++;
    
    const newItem: WishlistItem = {
      ...item,
      id,
      addedAt: new Date()
    };
    
    this.wishlistItems.set(id, newItem);
    return newItem;
  }
  
  async removeFromWishlist(wishlistId: number, productId: number): Promise<void> {
    const items = await this.getWishlistItems(wishlistId);
    const itemToRemove = items.find(item => item.productId === productId);
    
    if (itemToRemove) {
      this.wishlistItems.delete(itemToRemove.id);
    }
  }
  
  // PRICE ALERT METHODS
  async getPriceAlerts(userId: string): Promise<PriceAlert[]> {
    return Array.from(this.priceAlerts.values()).filter(
      alert => alert.userId === userId
    );
  }
  
  async getPriceAlertById(id: number): Promise<PriceAlert | undefined> {
    return this.priceAlerts.get(id);
  }
  
  async createPriceAlert(alert: InsertPriceAlert): Promise<PriceAlert> {
    const id = this.priceAlertId++;
    const now = new Date();
    
    const newAlert: PriceAlert = {
      ...alert,
      id,
      createdAt: now,
      lastNotifiedAt: null,
      isActive: true
    };
    
    this.priceAlerts.set(id, newAlert);
    return newAlert;
  }
  
  async updatePriceAlert(id: number, alertData: Partial<InsertPriceAlert>): Promise<PriceAlert> {
    const existingAlert = await this.getPriceAlertById(id);
    
    if (!existingAlert) {
      throw new Error(`Price alert with ID ${id} not found`);
    }
    
    const updatedAlert: PriceAlert = {
      ...existingAlert,
      ...alertData
    };
    
    this.priceAlerts.set(id, updatedAlert);
    return updatedAlert;
  }
  
  async deletePriceAlert(id: number): Promise<void> {
    if (!this.priceAlerts.has(id)) {
      throw new Error(`Price alert with ID ${id} not found`);
    }
    
    this.priceAlerts.delete(id);
  }
  
  // API SYNC METHODS
  async logApiSync(brandId: number): Promise<ApiSyncLog> {
    const id = this.apiSyncLogId++;
    const now = new Date();
    
    const log: ApiSyncLog = {
      id,
      brandId,
      startedAt: now,
      completedAt: null,
      status: "running",
      productsAdded: 0,
      productsUpdated: 0,
      errors: []
    };
    
    this.apiSyncLogs.set(id, log);
    return log;
  }
  
  async updateApiSyncLog(id: number, logData: Partial<ApiSyncLog>): Promise<ApiSyncLog> {
    const existingLog = this.apiSyncLogs.get(id);
    
    if (!existingLog) {
      throw new Error(`API sync log with ID ${id} not found`);
    }
    
    const updatedLog: ApiSyncLog = {
      ...existingLog,
      ...logData
    };
    
    this.apiSyncLogs.set(id, updatedLog);
    return updatedLog;
  }
  
  async getLatestApiSyncLog(brandId: number): Promise<ApiSyncLog | undefined> {
    const logs = Array.from(this.apiSyncLogs.values())
      .filter(log => log.brandId === brandId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
      
    return logs.length > 0 ? logs[0] : undefined;
  }
}

// Import the Database Storage implementation
import { DatabaseStorage } from "./database-storage";

// Create an instance of the appropriate storage implementation
export const storage = process.env.NODE_ENV === "production" 
  ? new DatabaseStorage()  // Use DatabaseStorage in production
  : new MemStorage();      // Use MemStorage in development for now
