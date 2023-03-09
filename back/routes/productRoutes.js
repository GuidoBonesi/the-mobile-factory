const express = require("express");
const productRouter = express.Router();
const axios = require("axios");
const Product = require("../models/Product");
const { defaults } = require("pg");

productRouter.get("/", (req, res) => {
  const fetchDataApi = async () => {
    try {
      const data = await axios.get(
        "https://api.device-specs.io/api/smartphones?populate=*&sort=general_year:desc&pagination[page]=50",
        {
          method: "GET",
          headers: {
            Authorization:
              "bearer 6c07431327b5d39c2c30a1cfd7ad0b295afce5acc8cf7c72b5a933cd6ddb8fd7e1790c633a329b705583479bf4f7fab77e77f02fee14e998e8bb9d79bacc1773a5e5233daea6ec639d9ab60e196641da43ca9b3174d8ce4d9c0e3948a14446afe4a07cdf63f9108681fb1491a5d61939d2283876e9fe588f64e86ffac845cb85",
          },
        }
      );
      const arrayProducts = data.data.data;
      const newArr = arrayProducts.map((cellphone) => {
        const newObj = {
          api_id: cellphone.id,
          name: cellphone.name,
          price: cellphone.prices[0].price
            ? cellphone.prices[0].price + "€"
            : "500€",
          color: cellphone.main.design_color_name || "Space gray",
          display_size: cellphone.main.display_size__inch + "''" || "5.5''",
          info: cellphone.info || "",
          images: cellphone.images ? cellphone.images.map((el) => el.url) : "",
          year:
            cellphone.main.general_year ||
            Math.floor(Math.random() * (2015 - 2022 + 1) + 2023),
          storage: cellphone.main.storage_capacity__gb + "gb" || "64gb",
          amountCores: cellphone.main.cpu_number_of_cores || "4",
          stock: Math.floor(Math.random() * 10),
        };
        return newObj;
      });
      newArr.forEach(async (cellphone) => {
        try {
          await Product.findOrCreate({
            where: { api_id: cellphone.api_id },
            defaults: cellphone,
          });
        } catch {
          throw new Error(`ERROR SEED DATABASE`);
        }
      });
      res.status(200).send(newArr);
    } catch {
      res.status(404).send(`DATA NOT AVAILABLE`);
    }
  };

  fetchDataApi();
});

productRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const selectedProduct = await Product.findByPk(id);
    selectedProduct
      ? res.status(200).send(selectedProduct)
      : res.status(204).send(`Product not found`);
  } catch (error) {
    console.log(error);
  }
});

module.exports = productRouter;