// =====================================================
// PRODUCTS PAGE
// Quản lý sản phẩm
// =====================================================

const ProductsPage = {
    products: [],

    async render() {
        const container = document.getElementById('pageContent');
        if (!container) return;

        Components.showLoading();

        try {
            // Load products from Supabase
            const result = await SupabaseAPI.request('/products?order=name.asc');
            this.products = result || [];

            Components.hideLoading();

            container.innerHTML = `
        <div class="page-header">
          <div class="search-box">
            <i data-lucide="search"></i>
            <input type="text" placeholder="Tìm sản phẩm..." id="productSearch">
          </div>
          
          <button class="btn btn-primary" onclick="ProductsPage.openCreateModal()">
            <i data-lucide="plus"></i> Thêm SP
          </button>
        </div>
        
        <!-- Products Grid -->
        <div class="products-grid" id="productsGrid">
          ${this.products.length > 0 ? this.products.map(p => this.renderProductCard(p)).join('') : `
            ${Components.emptyState('📦', 'Chưa có sản phẩm nào', 'Thêm sản phẩm để dễ chọn khi tạo liên hệ', 'Thêm sản phẩm', 'ProductsPage.openCreateModal()')}
          `}
        </div>
      `;

            this.initEventListeners();

            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        } catch (error) {
            Components.hideLoading();
            container.innerHTML = Components.emptyState('❌', 'Lỗi tải dữ liệu', error.message);
        }
    },

    renderProductCard(product) {
        return `
      <div class="product-card">
        <div class="product-card-header">
          <h3 class="product-name">${product.name}</h3>
          <div class="product-actions">
            <button class="btn-icon" onclick="ProductsPage.openEditModal('${product.id}')" title="Sửa">
              <i data-lucide="edit"></i>
            </button>
            <button class="btn-icon text-danger" onclick="ProductsPage.deleteProduct('${product.id}')" title="Xóa">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </div>
        ${product.description ? `<p class="product-desc">${product.description}</p>` : ''}
        <div class="product-meta">
          ${product.price ? `<span class="product-price">${Utils.formatCurrency(product.price)}</span>` : ''}
          ${product.unit ? `<span class="product-unit">/ ${product.unit}</span>` : ''}
        </div>
      </div>
    `;
    },

    initEventListeners() {
        const searchInput = document.getElementById('productSearch');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.filterProducts(e.target.value);
            }, 300));
        }
    },

    filterProducts(query) {
        const grid = document.getElementById('productsGrid');
        if (!grid) return;

        const filtered = this.products.filter(p =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            (p.description && p.description.toLowerCase().includes(query.toLowerCase()))
        );

        grid.innerHTML = filtered.length > 0
            ? filtered.map(p => this.renderProductCard(p)).join('')
            : Components.emptyState('🔍', 'Không tìm thấy', `Không có sản phẩm nào khớp "${query}"`);

        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    openCreateModal() {
        const content = this.renderProductForm();

        Components.openModal('Thêm sản phẩm mới', content, {
            confirmText: 'Tạo sản phẩm',
            onConfirm: () => this.createProduct()
        });
    },

    async openEditModal(id) {
        const product = this.products.find(p => p.id === id);
        if (!product) return;

        const content = this.renderProductForm(product);

        Components.openModal('Sửa sản phẩm', content, {
            confirmText: 'Lưu thay đổi',
            onConfirm: () => this.updateProduct(id)
        });
    },

    renderProductForm(product = {}) {
        return `
      <form id="productForm">
        ${Components.formField('name', 'Tên sản phẩm *', 'text', {
            value: product.name,
            required: true,
            placeholder: 'VD: Máy bơm nước ABC'
        })}
        
        ${Components.formField('description', 'Mô tả', 'textarea', {
            value: product.description,
            placeholder: 'Mô tả chi tiết sản phẩm...'
        })}
        
        <div class="form-row">
          ${Components.formField('price', 'Giá (VNĐ)', 'number', {
            value: product.price,
            placeholder: '0'
        })}
          ${Components.formField('unit', 'Đơn vị', 'text', {
            value: product.unit || 'cái',
            placeholder: 'cái, bộ, mét...'
        })}
        </div>
      </form>
    `;
    },

    async createProduct() {
        const form = document.getElementById('productForm');

        if (!Components.validateForm(form)) {
            Components.toast('Vui lòng điền tên sản phẩm', 'error');
            return;
        }

        const data = Components.getFormData(form);

        Components.showLoading();

        try {
            await SupabaseAPI.request('/products', {
                method: 'POST',
                body: JSON.stringify(data)
            });

            Components.toast('Đã tạo sản phẩm mới', 'success');
            Components.closeModal();
            this.render();
        } catch (error) {
            Components.hideLoading();
            Components.toast(error.message, 'error');
        }
    },

    async updateProduct(id) {
        const form = document.getElementById('productForm');

        if (!Components.validateForm(form)) {
            Components.toast('Vui lòng điền tên sản phẩm', 'error');
            return;
        }

        const data = Components.getFormData(form);
        data.updated_at = new Date().toISOString();

        Components.showLoading();

        try {
            await SupabaseAPI.request(`/products?id=eq.${id}`, {
                method: 'PATCH',
                body: JSON.stringify(data)
            });

            Components.toast('Đã cập nhật sản phẩm', 'success');
            Components.closeModal();
            this.render();
        } catch (error) {
            Components.hideLoading();
            Components.toast(error.message, 'error');
        }
    },

    async deleteProduct(id) {
        if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

        Components.showLoading();

        try {
            await SupabaseAPI.request(`/products?id=eq.${id}`, {
                method: 'DELETE'
            });

            Components.toast('Đã xóa sản phẩm', 'success');
            this.render();
        } catch (error) {
            Components.hideLoading();
            Components.toast(error.message, 'error');
        }
    },

    // Get products list for datalist/autocomplete
    async getProductsList() {
        if (this.products.length === 0) {
            try {
                const result = await SupabaseAPI.request('/products?is_active=eq.true&order=name.asc');
                this.products = result || [];
            } catch (e) {
                console.error('Failed to load products:', e);
            }
        }
        return this.products.map(p => p.name);
    }
};

// Make globally available
window.ProductsPage = ProductsPage;
