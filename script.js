let products = []
let allProducts = []
let editingProductId = null
let currentPage = 1
let pageSize = 12
let totalProducts = 0

const loadProductsBtn = document.getElementById("loadProducts")
const showAddFormBtn = document.getElementById("showAddForm")
const clearAllBtn = document.getElementById("clearAll")
const productForm = document.getElementById("productForm")
const productFormElement = document.getElementById("productFormElement")
const cancelFormBtn = document.getElementById("cancelForm")
const messageDiv = document.getElementById("message")
const loadingDiv = document.getElementById("loading")
const productsListDiv = document.getElementById("productsList")
const patchSection = document.getElementById("patchSection")

// Pagination elements
const paginationTop = document.getElementById("paginationTop")
const paginationBottom = document.getElementById("paginationBottom")
const paginationInfo = document.getElementById("paginationInfo")
const pageInfo = document.getElementById("pageInfo")
const pageInfoBottom = document.getElementById("pageInfoBottom")
const pageSizeSelect = document.getElementById("pageSize")

// Pagination buttons
const firstPageBtn = document.getElementById("firstPage")
const prevPageBtn = document.getElementById("prevPage")
const nextPageBtn = document.getElementById("nextPage")
const lastPageBtn = document.getElementById("lastPage")
const firstPageBottomBtn = document.getElementById("firstPageBottom")
const prevPageBottomBtn = document.getElementById("prevPageBottom")
const nextPageBottomBtn = document.getElementById("nextPageBottom")
const lastPageBottomBtn = document.getElementById("lastPageBottom")

// Event listeners
loadProductsBtn.addEventListener("click", loadProducts)
showAddFormBtn.addEventListener("click", showAddForm)
clearAllBtn.addEventListener("click", clearAllProducts)
productFormElement.addEventListener("submit", handleFormSubmit)
cancelFormBtn.addEventListener("click", hideForm)

// Pagination event listeners
firstPageBtn.addEventListener("click", () => goToPage(1))
prevPageBtn.addEventListener("click", () => goToPage(currentPage - 1))
nextPageBtn.addEventListener("click", () => goToPage(currentPage + 1))
lastPageBtn.addEventListener("click", () => goToPage(getTotalPages()))
firstPageBottomBtn.addEventListener("click", () => goToPage(1))
prevPageBottomBtn.addEventListener("click", () => goToPage(currentPage - 1))
nextPageBottomBtn.addEventListener("click", () => goToPage(currentPage + 1))
lastPageBottomBtn.addEventListener("click", () => goToPage(getTotalPages()))
pageSizeSelect.addEventListener("change", handlePageSizeChange)

function showMessage(text, type = "success") {
  messageDiv.textContent = text
  messageDiv.className = `message ${type}`
  messageDiv.classList.remove("hidden")
  setTimeout(() => {
    messageDiv.classList.add("hidden")
  }, 4000)
}

function showLoading(show = true) {
  if (show) {
    loadingDiv.classList.remove("hidden")
  } else {
    loadingDiv.classList.add("hidden")
  }
}

async function loadProducts() {
  showLoading(true)
  try {
    const response = await fetch("https://dummyjson.com/products?limit=100")
    const data = await response.json()
    allProducts = data.products
    totalProducts = allProducts.length
    currentPage = 1
    updateDisplayedProducts()
    showPagination(true)
    showMessage(`تم جلب ${totalProducts} منتج بنجاح! 📦`)
  } catch (error) {
    showMessage("حدث خطأ في جلب المنتجات ❌", "error")
    console.error("Error:", error)
  } finally {
    showLoading(false)
  }
}

function updateDisplayedProducts() {
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  products = allProducts.slice(startIndex, endIndex)
  displayProducts()
  updatePaginationInfo()
}

function displayProducts() {
  if (products.length === 0) {
    productsListDiv.innerHTML = '<p style="text-align: center; padding: 50px; color: #6c757d;">لا توجد منتجات للعرض</p>'
    return
  }

  productsListDiv.innerHTML = products
    .map(
      (product) => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.thumbnail || "/placeholder.svg?height=200&width=300"}"
                     alt="${product.title}"
                     onerror="this.style.display='none'; this.parentElement.innerHTML='🛍️'">
            </div>
            <div class="product-info">
                <div class="product-title">${product.title}</div>
                <div class="product-description">${product.description || "لا يوجد وصف"}</div>
                <div class="product-price">$${product.price}</div>
                <div class="product-category">${product.category || "غير محدد"}</div>
                <div class="product-actions">
                    <button class="btn btn-warning" onclick="editProduct(${product.id})">
                        ✏️ تعديل (PUT)
                    </button>
                    <button class="btn btn-danger" onclick="deleteProduct(${product.id})">
                        🗑️ حذف (DELETE)
                    </button>
                </div>
                <div style="margin-top: 10px;">
                    <button class="btn btn-secondary" onclick="showPatchOptions(${product.id})" style="width: 100%;">
                        🔧 تعديل جزئي (PATCH)
                    </button>
                </div>
            </div>
        </div>
    `,
    )
    .join("")
}

function getTotalPages() {
  return Math.ceil(totalProducts / pageSize)
}

function goToPage(page) {
  const totalPages = getTotalPages()
  if (page < 1 || page > totalPages) return
  
  currentPage = page
  updateDisplayedProducts()
}

function handlePageSizeChange() {
  pageSize = parseInt(pageSizeSelect.value)
  currentPage = 1
  updateDisplayedProducts()
}

function updatePaginationInfo() {
  const totalPages = getTotalPages()
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalProducts)
  
  // Update info text
  paginationInfo.textContent = `عرض ${startItem}-${endItem} من ${totalProducts} منتج`
  
  // Update page info
  const pageText = `صفحة ${currentPage} من ${totalPages}`
  pageInfo.textContent = pageText
  pageInfoBottom.textContent = pageText
  
  // Update button states
  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === totalPages
  
  firstPageBtn.disabled = isFirstPage
  prevPageBtn.disabled = isFirstPage
  nextPageBtn.disabled = isLastPage
  lastPageBtn.disabled = isLastPage
  
  firstPageBottomBtn.disabled = isFirstPage
  prevPageBottomBtn.disabled = isLastPage
  nextPageBottomBtn.disabled = isLastPage
  lastPageBottomBtn.disabled = isLastPage
}

function showPagination(show = true) {
  if (show && totalProducts > 0) {
    paginationTop.classList.remove("hidden")
    paginationBottom.classList.remove("hidden")
  } else {
    paginationTop.classList.add("hidden")
    paginationBottom.classList.add("hidden")
  }
}

function showAddForm() {
  editingProductId = null
  document.getElementById("formTitle").textContent = "إضافة منتج جديد (POST)"
  document.getElementById("productId").value = ""
  document.getElementById("productTitle").value = ""
  document.getElementById("productDescription").value = ""
  document.getElementById("productPrice").value = ""
  document.getElementById("productCategory").value = ""
  productForm.classList.remove("hidden")
  document.getElementById("productTitle").focus()
}

function hideForm() {
  productForm.classList.add("hidden")
  editingProductId = null
}

async function handleFormSubmit(e) {
  e.preventDefault()
  const title = document.getElementById("productTitle").value
  const description = document.getElementById("productDescription").value
  const price = Number.parseFloat(document.getElementById("productPrice").value)
  const category = document.getElementById("productCategory").value

  if (!title || !price) {
    showMessage("يرجى ملء الحقول المطلوبة ⚠️", "error")
    return
  }

  const productData = {
    title,
    description,
    price,
    category,
  }

  if (editingProductId) {
    await updateProduct(editingProductId, productData)
  } else {
    await addProduct(productData)
  }
}

async function addProduct(productData) {
  try {
    const response = await fetch("https://dummyjson.com/products/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    })
    const newProduct = await response.json()
    allProducts.unshift(newProduct)
    totalProducts = allProducts.length
    currentPage = 1
    updateDisplayedProducts()
    hideForm()
    showMessage(`تم إضافة "${newProduct.title}" بنجاح! ✅`)
  } catch (error) {
    showMessage("حدث خطأ في إضافة المنتج ❌", "error")
    console.error("Error:", error)
  }
}

function editProduct(productId) {
  const product = allProducts.find((p) => p.id === productId)
  if (!product) return

  editingProductId = productId
  document.getElementById("formTitle").textContent = "تعديل المنتج (PUT)"
  document.getElementById("productId").value = productId
  document.getElementById("productTitle").value = product.title
  document.getElementById("productDescription").value = product.description || ""
  document.getElementById("productPrice").value = product.price
  document.getElementById("productCategory").value = product.category || ""
  productForm.classList.remove("hidden")
  document.getElementById("productTitle").focus()
}

async function updateProduct(productId, productData) {
  try {
    const response = await fetch(`https://dummyjson.com/products/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    })
    const updatedProduct = await response.json()
    const index = allProducts.findIndex((p) => p.id === productId)
    if (index !== -1) {
      allProducts[index] = { ...allProducts[index], ...updatedProduct }
      updateDisplayedProducts()
    }
    hideForm()
    showMessage(`تم تحديث "${updatedProduct.title}" بنجاح! 🔄`)
  } catch (error) {
    showMessage("حدث خطأ في تحديث المنتج ❌", "error")
    console.error("Error:", error)
  }
}

async function deleteProduct(productId) {
  if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
    return
  }

  try {
    await fetch(`https://dummyjson.com/products/${productId}`, {
      method: "DELETE",
    })
    allProducts = allProducts.filter((p) => p.id !== productId)
    totalProducts = allProducts.length
    
    // Adjust current page if necessary
    const totalPages = getTotalPages()
    if (currentPage > totalPages && totalPages > 0) {
      currentPage = totalPages
    }
    
    updateDisplayedProducts()
    showMessage("تم حذف المنتج بنجاح! 🗑️")
    
    if (totalProducts === 0) {
      showPagination(false)
    }
  } catch (error) {
    showMessage("حدث خطأ في حذف المنتج ❌", "error")
    console.error("Error:", error)
  }
}

function showPatchOptions(productId) {
  const product = allProducts.find((p) => p.id === productId)
  if (!product) return

  patchSection.innerHTML = `
        <h4>تعديل جزئي للمنتج: ${product.title}</h4>
        <div class="patch-form">
            <div class="patch-item">
                <h4>السعر الحالي: $${product.price}</h4>
                <div class="patch-input">
                    <input type="number" id="newPrice" placeholder="سعر جديد" step="0.01">
                    <button class="btn btn-primary" onclick="patchProduct(${productId}, 'price', document.getElementById('newPrice').value)">
                        تحديث السعر
                    </button>
                </div>
            </div>
            
            <div class="patch-item">
                <h4>الفئة الحالية: ${product.category || "غير محدد"}</h4>
                <div class="patch-input">
                    <input type="text" id="newCategory" placeholder="فئة جديدة">
                    <button class="btn btn-primary" onclick="patchProduct(${productId}, 'category', document.getElementById('newCategory').value)">
                        تحديث الفئة
                    </button>
                </div>
            </div>
            
            <div class="patch-item">
                <h4>العنوان الحالي: ${product.title}</h4>
                <div class="patch-input">
                    <input type="text" id="newTitle" placeholder="عنوان جديد">
                    <button class="btn btn-primary" onclick="patchProduct(${productId}, 'title', document.getElementById('newTitle').value)">
                        تحديث العنوان
                    </button>
                </div>
            </div>
        </div>
    `
}

async function patchProduct(productId, field, value) {
  if (!value || value.trim() === "") {
    showMessage("يرجى إدخال قيمة صحيحة ⚠️", "error")
    return
  }

  try {
    const patchData = {}
    patchData[field] = field === "price" ? Number.parseFloat(value) : value

    const response = await fetch(`https://dummyjson.com/products/${productId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patchData),
    })
    const updatedProduct = await response.json()
    const index = allProducts.findIndex((p) => p.id === productId)
    if (index !== -1) {
      allProducts[index] = { ...allProducts[index], ...updatedProduct }
      updateDisplayedProducts()
    }
    showMessage(`تم تحديث ${field} بنجاح! 🔧`)
    showPatchOptions(productId)
  } catch (error) {
    showMessage("حدث خطأ في التحديث الجزئي ❌", "error")
    console.error("Error:", error)
  }
}

function clearAllProducts() {
  if (allProducts.length === 0) {
    showMessage("لا توجد منتجات لمسحها ⚠️", "error")
    return
  }

  if (confirm("هل أنت متأكد من مسح جميع المنتجات؟")) {
    allProducts = []
    products = []
    totalProducts = 0
    currentPage = 1
    displayProducts()
    showPagination(false)
    patchSection.innerHTML = "<p>اختر منتج من القائمة أعلاه لتعديل خصائصه بشكل جزئي</p>"
    showMessage("تم مسح جميع المنتجات! 🧹")
  }
}

window.addEventListener("load", () => {
  showMessage('مرحباً! اضغط على "جلب المنتجات" للبدء 👋')
})
