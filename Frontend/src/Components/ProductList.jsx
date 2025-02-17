import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import SecondaryNavbar from "./SecondaryNavbar";
import Navbar from "./Navbar";

const ProductList = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const categoryMapping = {
    beauty: "Beauty Products",
    footwear: "Footwear",
    bags: "Bags",
    clothing: "Clothing",
  };

  const normalizedCategory = categoryMapping[category.toLowerCase()] || category;

  useEffect(() => {
    // Reset filter, sort, and search when the category changes
    setFilter("");
    setSortOption("");
    setSearchTerm("");
  }, [normalizedCategory]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("https://eco-conscious-z418.onrender.com/api/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const data = response.data;
        const filteredProducts =
          normalizedCategory === "All"
            ? data
            : data.filter((product) => product.category === normalizedCategory);

        const filteredAndSortedProducts = filterProducts(filteredProducts);
        setProducts(filteredAndSortedProducts);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, [normalizedCategory, filter, sortOption]);

  const filterProducts = (products) => {
    let filtered = products;

    if (filter) {
      filtered = filtered.filter((product) => {
        switch (filter) {
          case "low_carbon_footprint":
            return product.carbonFootprint < 5;
          case "material_sourcing_good":
            return product.materialSourcing === "good";
          case "material_sourcing_better":
            return product.materialSourcing === "better";
          case "material_sourcing_best":
            return product.materialSourcing === "best";
          case "high_recyclability":
            return product.recyclability >= 85;
          case "low_water_usage":
            return product.waterUsage === "low";
          case "high_energy_efficiency":
            return product.energyEfficiency === "high";
          case "high_biodegradability":
            return product.biodegradability > 90;
          default:
            return true;
        }
      });
    }

    if (searchTerm) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  };
                                                                
  const sortProducts = (products) => {
    if (sortOption === "price_low_high") {
      return products.sort((a, b) => a.price - b.price);
    } else if (sortOption === "price_high_low") {
      return products.sort((a, b) => b.price - a.price);
    }
    return products;
  };

  const filteredAndSortedProducts = sortProducts(filterProducts(products));

  const getFilterTag = (product) => {
    switch (filter) {
      case "low_carbon_footprint":
        return `Low Carbon Footprint: ${product.carbonFootprint}`;
      case "material_sourcing_good":
        return "Material Sourcing: Good";
      case "material_sourcing_better":
        return "Material Sourcing: Better";
      case "material_sourcing_best":
        return "Material Sourcing: Best";
      case "high_recyclability":
        return `High Recyclability: ${product.recyclability}%`;
      case "low_water_usage":
        return "Low Water Usage";
      case "high_energy_efficiency":
        return "High Energy Efficiency";
      case "high_biodegradability":
        return `High Biodegradability: ${product.biodegradability}%`;
      default:
        return "";
    }
  };

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>Error fetching products: {error.message}</p>;

  return (
    <div style={styles.outerContainer}>
      <SecondaryNavbar
        currentCategory={normalizedCategory}
        sortOption={sortOption} // Pass sortOption to SecondaryNavbar
        onSortSelect={(value) => setSortOption(value)}
        onFilterSelect={(value) => setFilter(value)}
      />
      <div style={styles.app}>
        <div style={styles.productGrid}>
          {filteredAndSortedProducts.length === 0 ? (
            <p>No products match the selected criteria.</p>
          ) : (
            filteredAndSortedProducts.map((product) => (
              <Link
                to={`/products/${category}/${product._id}`}
                key={product._id}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div style={styles.productCard}>
                  <img
                    src={product.image}
                    alt={product.name}
                    style={styles.productImage}
                  />
                  <h3 style={styles.productBrand}>{product.brand}</h3>
                  <p style={styles.productName}>{product.name}</p>
                  <div style={styles.rating}>
                    {product.rating} ★★★★★ | {product.reviews} reviews
                  </div>
                  <div style={styles.price}>
                    <span>$ {product.price}</span>
                  </div>
                  {/* Add filter tag below the price */}
                  {filter && (
                    <div style={styles.filterTag}>
                      {getFilterTag(product)}
                    </div>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  outerContainer: {
    backgroundColor: "#f9f9f9",
  },
  app: {
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    width: "80%",
    margin: "0 auto",
  },
  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", // Responsive grid
    gap: "30px",
    maxWidth: "1450px",
    margin: "0 auto",
  },
  productCard: {
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    overflow: "hidden",
    textAlign: "center",
    padding: "30px",
    height: "300px", // Increased to accommodate the new tag
    transition: "box-shadow 0.3s ease",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    paddingBottom: "40px",
  },
  productImage: {
    width: "100%",
    height: "200px",
    objectFit: "contain",
    borderRadius: "8px",
  },
  productBrand: {
    fontSize: "16px",
    margin: "10px 0",
    color: "#333",
  },
  productName: {
    fontSize: "16px",
    color: "black",
    margin: "5px 0",
    fontWeight: "700",
  },
  rating: {
    fontSize: "12px",
    color: "#555",
    margin: "10px 0",
  },
  price: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#777",
  },
  filterTag: {
    // marginTop: "10px",
    fontSize: "14px",
    padding:'10px',
    fontStyle: "italic",
    color: "#00796b",
  },
};

export default ProductList;
