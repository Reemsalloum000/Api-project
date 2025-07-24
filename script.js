let products = []
let editingProductId = null

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

loadProductsBtn.addEventListener("click", loadProducts)
showAddFormBtn.addEventListener("click", showAddForm)
clearAllBtn.addEventListener("click", clearAllProducts)
productFormElement.addEventListener("submit", handleFormSubmit)
cancelFormBtn.addEventListener("click", hideForm)

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
    const response = await fetch("https://dummyjson.com/products?limit=12")
    const data = await response.json()

    products = data.products
    displayProducts()
    showMessage(`تم جلب ${products.length} منتج بنجاح! 📦`)
  } catch (error) {
    showMessage("حدث خطأ في جلب المنتجات ❌", "error")
    console.error("Error:", error)
  } finally {
    showLoading(false)
  }
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

    products.unshift(newProduct)
    displayProducts()
    hideForm()

    showMessage(`تم إضافة "${newProduct.title}" بنجاح! ✅`)
  } catch (error) {
    showMessage("حدث خطأ في إضافة المنتج ❌", "error")
    console.error("Error:", error)
  }
}

function editProduct(productId) {
  const product = products.find((p) => p.id === productId)
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

    const index = products.findIndex((p) => p.id === productId)
    if (index !== -1) {
      products[index] = { ...products[index], ...updatedProduct }
      displayProducts()
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

    products = products.filter((p) => p.id !== productId)
    displayProducts()

    showMessage("تم حذف المنتج بنجاح! 🗑️")
  } catch (error) {
    showMessage("حدث خطأ في حذف المنتج ❌", "error")
    console.error("Error:", error)
  }
}

function showPatchOptions(productId) {
  const product = products.find((p) => p.id === productId)
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

    const index = products.findIndex((p) => p.id === productId)
    if (index !== -1) {
      products[index] = { ...products[index], ...updatedProduct }
      displayProducts()
    }

    showMessage(`تم تحديث ${field} بنجاح! 🔧`)

    showPatchOptions(productId)
  } catch (error) {
    showMessage("حدث خطأ في التحديث الجزئي ❌", "error")
    console.error("Error:", error)
  }
}

function clearAllProducts() {
  if (products.length === 0) {
    showMessage("لا توجد منتجات لمسحها ⚠️", "error")
    return
  }

  if (confirm("هل أنت متأكد من مسح جميع المنتجات؟")) {
    products = []
    displayProducts()
    patchSection.innerHTML = "<p>اختر منتج من القائمة أعلاه لتعديل خصائصه بشكل جزئي</p>"
    showMessage("تم مسح جميع المنتجات! 🧹")
  }
}

window.addEventListener("load", () => {
  showMessage('مرحباً! اضغط على "جلب المنتجات" للبدء 👋')
})
