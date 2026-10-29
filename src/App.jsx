
import { useEffect, useMemo, useState } from "react";
import "./App.css";

const simpleColours = [
  "Black", "White", "Grey", "Brown", "Beige", "Cream",
  "Red", "Orange", "Yellow", "Green", "Blue", "Navy",
  "Purple", "Pink", "Multi-colour", "Other",
];

const categories = [
  "Tops", "Trousers", "Jeans", "Dresses", "Skirts",
  "Jackets & Coats", "Shoes", "Bags", "Accessories",
  "Knitwear", "Other",
];

const stockOptions = ["In stock", "Low stock", "Out of stock", "Unknown"];

const emptyForm = {
  name: "",
  brand: "",
  category: "Tops",
  colour: "",
  simpleColour: "",
  price: "",
  size: "",
  stock: "Unknown",
  image: "",
  link: "",
};

const starterItems = [
  {
    id: 1,
    name: "Relaxed Fit T-Shirt",
    brand: "M&S",
    category: "Tops",
    colour: "Henna",
    simpleColour: "Orange",
    price: "19.50",
    size: "M",
    stock: "In stock",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    link: "https://www.marksandspencer.com/",
  },
  {
    id: 2,
    name: "Straight Leg Jeans",
    brand: "ASOS",
    category: "Jeans",
    colour: "Mid wash blue",
    simpleColour: "Blue",
    price: "35.00",
    size: "32",
    stock: "In stock",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80",
    link: "https://www.asos.com/",
  },
  {
    id: 3,
    name: "Everyday Oxford Shirt",
    brand: "Abercrombie & Fitch",
    category: "Tops",
    colour: "White",
    simpleColour: "White",
    price: "60.00",
    size: "M",
    stock: "Unknown",
    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=80",
    link: "https://www.abercrombie.com/",
  },
  {
    id: 4,
    name: "Crew Neck Knit",
    brand: "Uniqlo",
    category: "Knitwear",
    colour: "Navy",
    simpleColour: "Navy",
    price: "29.90",
    size: "M",
    stock: "In stock",
    image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=900&q=80",
    link: "https://www.uniqlo.com/",
  },
];

function loadItems() {
  try {
    const saved = localStorage.getItem("threadlist-items");

    if (saved !== null) {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed.map((item) => ({
          ...emptyForm,
          ...item,
          simpleColour: item.simpleColour || "",
        }));
      }
    }
  } catch (error) {
    console.error("Could not load wishlist items:", error);
  }

  return starterItems;
}

function loadInspirations() {
  try {
    const saved = localStorage.getItem("threadlist-inspirations");

    if (saved !== null) {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (error) {
    console.error("Could not load inspiration images:", error);
  }

  return [];
}

function formatPrice(price) {
  if (price === "" || price === null || price === undefined) {
    return "Price not set";
  }

  const amount = Number(price);

  if (Number.isNaN(amount)) return String(price);

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
}

function App() {
  const [items, setItems] = useState(loadItems);
  const [inspirations, setInspirations] = useState(loadInspirations);

  const [page, setPage] = useState("wishlist");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [brandFilter, setBrandFilter] = useState("All");
  const [colourFilter, setColourFilter] = useState("All");

  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const [inspirationTitle, setInspirationTitle] = useState("");
  const [inspirationImage, setInspirationImage] = useState("");
  const [selectedInspiration, setSelectedInspiration] = useState(null);

  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem("threadlist-items", JSON.stringify(items));
    } catch (error) {
      console.error("Could not save wishlist:", error);
      setNotice("Your wishlist could not be saved. Try removing some large images.");
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem("threadlist-inspirations", JSON.stringify(inspirations));
    } catch (error) {
      console.error("Could not save inspiration images:", error);
      setNotice("Your inspiration gallery is too large to save. Try using smaller images.");
    }
  }, [inspirations]);

  const brands = useMemo(
    () => [...new Set(items.map((item) => item.brand).filter(Boolean))].sort(),
    [items]
  );

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      const searchableText = [
        item.name,
        item.brand,
        item.category,
        item.colour,
        item.simpleColour,
        item.size,
        item.stock,
      ].filter(Boolean).join(" ").toLowerCase();

      return (
        searchableText.includes(query) &&
        (categoryFilter === "All" || item.category === categoryFilter) &&
        (brandFilter === "All" || item.brand === brandFilter) &&
        (colourFilter === "All" || item.simpleColour === colourFilter)
      );
    });
  }, [items, search, categoryFilter, brandFilter, colourFilter]);

  const totalValue = items.reduce(
    (total, item) => total + (Number(item.price) || 0),
    0
  );

  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({ ...current, [name]: value }));
  }

  function resetForm() {
    setFormData(emptyForm);
    setEditingId(null);
  }

  function openAddForm() {
    resetForm();
    setPage("add");
    setNotice("");
  }

  function openEditForm(item) {
    setFormData({
      ...emptyForm,
      ...item,
      simpleColour: item.simpleColour || "",
    });

    setEditingId(item.id);
    setSelectedItem(null);
    setPage("add");
    setNotice("");
  }

  function handleProductSubmit(event) {
    event.preventDefault();

    if (!formData.name.trim() || !formData.brand.trim()) {
      setNotice("Please enter a product name and brand.");
      return;
    }

    const product = {
      ...formData,
      id: editingId ?? Date.now(),
      name: formData.name.trim(),
      brand: formData.brand.trim(),
      colour: formData.colour.trim(),
      simpleColour: formData.simpleColour,
    };

    if (editingId !== null) {
      setItems((current) =>
        current.map((item) => item.id === editingId ? product : item)
      );
      setNotice("Product updated.");
    } else {
      setItems((current) => [product, ...current]);
      setNotice("Product added to your wishlist.");
    }

    resetForm();
    setSelectedItem(null);
    setPage("wishlist");
  }

  function deleteProduct(id) {
    if (!window.confirm("Are you sure you want to remove this item from your wishlist?")) {
      return;
    }

    setItems((current) => current.filter((item) => item.id !== id));

    if (selectedItem?.id === id) {
      setSelectedItem(null);
      setPage("wishlist");
    }

    setNotice("Product removed.");
  }

  function openProductDetails(item) {
    setSelectedItem(item);
    setPage("details");
    setNotice("");
  }

  function navigateTo(nextPage) {
    setPage(nextPage);
    setNotice("");
    setSelectedItem(null);
    setSelectedInspiration(null);
    resetForm();
  }

  function handleInspirationFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setNotice("Please choose an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 1.5 * 1024 * 1024) {
      setNotice("Please choose an image smaller than 1.5 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setInspirationImage(String(reader.result));
      setNotice("");
    };

    reader.onerror = () => {
      setNotice("Could not read that image. Please try another.");
    };

    reader.readAsDataURL(file);
  }

  function saveInspiration(event) {
    event.preventDefault();

    if (!inspirationImage) {
      setNotice("Please choose an image first.");
      return;
    }

    const inspiration = {
      id: Date.now(),
      title: inspirationTitle.trim() || "Untitled outfit",
      image: inspirationImage,
      date: new Date().toLocaleDateString("en-GB"),
    };

    setInspirations((current) => [inspiration, ...current]);
    setInspirationTitle("");
    setInspirationImage("");
    setNotice("Outfit inspiration saved.");

    const fileInput = document.getElementById("inspirationImage");
    if (fileInput) fileInput.value = "";
  }

  function deleteInspiration(id) {
    if (!window.confirm("Are you sure you want to delete this inspiration image?")) {
      return;
    }

    setInspirations((current) =>
      current.filter((inspiration) => inspiration.id !== id)
    );

    if (selectedInspiration?.id === id) setSelectedInspiration(null);

    setNotice("Inspiration image deleted.");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button
          className="brand-logo"
          onClick={() => navigateTo("wishlist")}
          aria-label="Threadlist home"
        >
          <span className="brand-mark">T</span>
          <span>threadlist</span>
        </button>

        <p className="sidebar-label">YOUR WARDROBE</p>

        <nav className="sidebar-nav">
          <button
            className={page === "wishlist" || page === "details" ? "active" : ""}
            onClick={() => navigateTo("wishlist")}
          >
            <span>♡</span>
            My wishlist
          </button>

          <button
            className={page === "inspiration" ? "active" : ""}
            onClick={() => navigateTo("inspiration")}
          >
            <span>✧</span>
            Outfit inspiration
          </button>
        </nav>

        <div className="sidebar-bottom">
          <p>Keep track of the pieces you love.</p>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <span className="topbar-label">YOUR PERSONAL STYLE SPACE</span>
          <button className="primary-button" onClick={openAddForm}>
            + Add an item
          </button>
        </header>

        {notice && (
          <div className="notice" role="status">
            <span>{notice}</span>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => setNotice("")}
            >
              ×
            </button>
          </div>
        )}

        {page === "wishlist" && (
          <section className="page-section">
            <div className="page-header">
              <div>
                <p className="eyebrow">THE COLLECTION</p>
                <h1>My wishlist</h1>
                <p className="page-description">
                  All the pieces you have your eye on, in one place.
                </p>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">Items saved</span>
                <strong>{items.length}</strong>
              </div>
              <div className="stat-card">
                <span className="stat-label">Total wishlist value</span>
                <strong>{formatPrice(totalValue)}</strong>
              </div>
              <div className="stat-card">
                <span className="stat-label">Brands</span>
                <strong>{brands.length}</strong>
              </div>
            </div>

            <div className="filters">
              <input
                type="search"
                placeholder="Search items, brands or colours..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search wishlist"
              />

              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                aria-label="Filter by category"
              >
                <option value="All">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={brandFilter}
                onChange={(event) => setBrandFilter(event.target.value)}
                aria-label="Filter by brand"
              >
                <option value="All">All brands</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>

              <select
                value={colourFilter}
                onChange={(event) => setColourFilter(event.target.value)}
                aria-label="Filter by colour"
              >
                <option value="All">All colours</option>
                {simpleColours.map((colour) => (
                  <option key={colour} value={colour}>{colour}</option>
                ))}
              </select>
            </div>

            <div className="results-heading">
              <h2>Your saved pieces</h2>
              <span>{filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}</span>
            </div>

            {filteredItems.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">♡</span>
                <h3>No items found</h3>
                <p>Try changing your filters, or add a new item to your wishlist.</p>
                <button className="primary-button" onClick={openAddForm}>Add an item</button>
              </div>
            ) : (
              <div className="product-grid">
                {filteredItems.map((item) => (
                  <article
                    className="product-card"
                    key={item.id}
                    onClick={() => openProductDetails(item)}
                  >
                    <div className="product-image-wrap">
                      {item.image ? (
                        <img
                          className="product-image"
                          src={item.image}
                          alt={item.name}
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="image-placeholder">
                          <span>♡</span>
                          <small>No image added</small>
                        </div>
                      )}

                      <button
                        className="card-delete"
                        type="button"
                        title="Remove item"
                        aria-label={`Remove ${item.name}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteProduct(item.id);
                        }}
                      >
                        ×
                      </button>
                    </div>

                    <div className="product-card-content">
                      <p className="product-brand">{item.brand}</p>
                      <h3>{item.name}</h3>
                      <p className="product-price">{formatPrice(item.price)}</p>

                      <div className="product-tags">
                        {item.category && (
                          <span className="product-tag">{item.category}</span>
                        )}

                        {item.size && (
                          <span className="product-tag">{item.size}</span>
                        )}

                        {/* Show the simple colour category, not retailer colour */}
                        {item.simpleColour && (
                          <span className="product-tag">{item.simpleColour}</span>
                        )}

                        {item.stock && (
                          <span
                            className={`product-tag ${
                              item.stock === "In stock" ? "product-tag-stock" : ""
                            }`}
                          >
                            {item.stock}
                          </span>
                        )}
                      </div>

                      <div className="product-card-actions">
                        <button
                          type="button"
                          className="view-item-button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openProductDetails(item);
                          }}
                        >
                          View Item
                        </button>

                        {item.link ? (
                          <a
                            className="retailer-button"
                            href={item.link}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(event) => event.stopPropagation()}
                          >
                            Retailer ↗
                          </a>
                        ) : (
                          <button type="button" className="retailer-button" disabled>
                            Retailer
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {page === "add" && (
          <section className="page-section form-page">
            <div className="page-header">
              <div>
                <p className="eyebrow">YOUR COLLECTION</p>
                <h1>{editingId !== null ? "Edit item" : "Add an item"}</h1>
                <p className="page-description">
                  Save the details of something you would love to own.
                </p>
              </div>
            </div>

            <form className="product-form" onSubmit={handleProductSubmit}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="name">Product name *</label>
                  <input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Relaxed fit cotton shirt" required />
                </div>

                <div className="form-group">
                  <label htmlFor="brand">Brand *</label>
                  <input id="brand" name="brand" value={formData.brand} onChange={handleInputChange} placeholder="e.g. M&S" required />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select id="category" name="category" value={formData.category} onChange={handleInputChange}>
                    {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="colour">Retailer colour name</label>
                  <input id="colour" name="colour" value={formData.colour} onChange={handleInputChange} placeholder="e.g. Henna, Dark Olive, Stone" />
                  <small>Keep the original colour name used by the retailer.</small>
                </div>

                <div className="form-group">
                  <label htmlFor="simpleColour">Colour category</label>
                  <select id="simpleColour" name="simpleColour" value={formData.simpleColour} onChange={handleInputChange}>
                    <option value="">Choose a colour</option>
                    {simpleColours.map((colour) => <option key={colour} value={colour}>{colour}</option>)}
                  </select>
                  <small>Choose a simple colour for filtering and product tags.</small>
                </div>

                <div className="form-group">
                  <label htmlFor="price">Price (£)</label>
                  <input id="price" name="price" type="number" min="0" step="0.01" value={formData.price} onChange={handleInputChange} placeholder="e.g. 29.99" />
                </div>

                <div className="form-group">
                  <label htmlFor="size">Size</label>
                  <input id="size" name="size" value={formData.size} onChange={handleInputChange} placeholder="e.g. M, 32, UK 10" />
                </div>

                <div className="form-group">
                  <label htmlFor="stock">Stock status</label>
                  <select id="stock" name="stock" value={formData.stock} onChange={handleInputChange}>
                    {stockOptions.map((stock) => <option key={stock} value={stock}>{stock}</option>)}
                  </select>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="image">Product image URL</label>
                  <input id="image" name="image" type="url" value={formData.image} onChange={handleInputChange} placeholder="https://..." />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="link">Retailer product URL</label>
                  <input id="link" name="link" type="url" value={formData.link} onChange={handleInputChange} placeholder="https://..." />
                </div>
              </div>

              <div className="form-actions">
                <button className="secondary-button" type="button" onClick={() => navigateTo("wishlist")}>Cancel</button>
                <button className="primary-button" type="submit">
                  {editingId !== null ? "Save changes" : "Add to wishlist"}
                </button>
              </div>
            </form>
          </section>
        )}

        {page === "details" && selectedItem && (
          <section className="page-section">
            <button className="back-button" onClick={() => navigateTo("wishlist")}>
              ← Back to wishlist
            </button>

            <div className="detail-layout">
              <div className="detail-image-wrap">
                {selectedItem.image ? (
                  <img src={selectedItem.image} alt={selectedItem.name} className="detail-image" />
                ) : (
                  <div className="image-placeholder">
                    <span>♡</span>
                    <small>No image added</small>
                  </div>
                )}
              </div>

              <div className="detail-content">
                <p className="eyebrow">{selectedItem.brand}</p>
                <h1>{selectedItem.name}</h1>
                <p className="detail-price">{formatPrice(selectedItem.price)}</p>

                <div className="detail-fields">
                  <div><span>Category</span><strong>{selectedItem.category || "Not specified"}</strong></div>
                  <div><span>Retailer colour</span><strong>{selectedItem.colour || "Not specified"}</strong></div>
                  <div><span>Colour category</span><strong>{selectedItem.simpleColour || "Not specified"}</strong></div>
                  <div><span>Size</span><strong>{selectedItem.size || "Not specified"}</strong></div>
                  <div><span>Stock status</span><strong>{selectedItem.stock || "Unknown"}</strong></div>
                </div>

                <div className="detail-actions">
                  {selectedItem.link && (
                    <a className="primary-button" href={selectedItem.link} target="_blank" rel="noreferrer">
                      View at retailer ↗
                    </a>
                  )}
                  <button className="secondary-button" onClick={() => openEditForm(selectedItem)}>Edit item</button>
                  <button className="danger-button" onClick={() => deleteProduct(selectedItem.id)}>Remove item</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {page === "inspiration" && (
          <section className="page-section">
            <div className="page-header">
              <div>
                <p className="eyebrow">YOUR STYLE JOURNAL</p>
                <h1>Outfit inspiration</h1>
                <p className="page-description">
                  Save looks, outfits and ideas you want to come back to.
                </p>
              </div>
            </div>

            <form className="inspiration-form" onSubmit={saveInspiration}>
              <h2>Add inspiration</h2>

              <div className="form-group">
                <label htmlFor="inspirationTitle">Title (optional)</label>
                <input id="inspirationTitle" value={inspirationTitle} onChange={(event) => setInspirationTitle(event.target.value)} placeholder="e.g. Autumn everyday outfit" />
              </div>

              <div className="form-group">
                <label htmlFor="inspirationImage">Choose an image</label>
                <input id="inspirationImage" type="file" accept="image/*" onChange={handleInspirationFile} />
                <small>Images must be smaller than 1.5 MB.</small>
              </div>

              {inspirationImage && (
                <div className="inspiration-preview">
                  <img src={inspirationImage} alt="Selected outfit preview" />
                </div>
              )}

              <button className="primary-button" type="submit">Save inspiration</button>
            </form>

            <div className="results-heading">
              <h2>Saved inspiration</h2>
              <span>{inspirations.length} {inspirations.length === 1 ? "image" : "images"}</span>
            </div>

            {inspirations.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">✧</span>
                <h3>Your style journal starts here</h3>
                <p>Upload an outfit image to start collecting inspiration.</p>
              </div>
            ) : (
              <div className="inspiration-grid">
                {inspirations.map((inspiration) => (
                  <article className="inspiration-card" key={inspiration.id}>
                    <button
                      className="inspiration-image-button"
                      onClick={() => setSelectedInspiration(inspiration)}
                      aria-label={`View ${inspiration.title}`}
                    >
                      <img src={inspiration.image} alt={inspiration.title} />
                    </button>

                    <div className="inspiration-card-content">
                      <h3>{inspiration.title}</h3>
                      <p>{inspiration.date}</p>
                      <button className="danger-button" onClick={() => deleteInspiration(inspiration.id)}>Delete</button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {selectedInspiration && (
              <div className="modal-backdrop" onClick={() => setSelectedInspiration(null)} role="presentation">
                <div
                  className="image-modal"
                  role="dialog"
                  aria-modal="true"
                  aria-label={selectedInspiration.title}
                  onClick={(event) => event.stopPropagation()}
                >
                  <button className="modal-close" onClick={() => setSelectedInspiration(null)} aria-label="Close image">×</button>
                  <img src={selectedInspiration.image} alt={selectedInspiration.title} />
                  <h2>{selectedInspiration.title}</h2>
                  <p>{selectedInspiration.date}</p>
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
