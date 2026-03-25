// seedCategories.js
const { MongoClient, ObjectId } = require('mongodb');

async function seedCategories() {
  const uri = "mongodb://localhost:27017"; // replace with your MongoDB URI
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("spaalita_database"); // replace with your DB name
    const collection = db.collection("categories");

    const categories = [
      {
        _id: new ObjectId(),
        oId: 17,
        name: "Comfort zone",
        slug: "comfort-zone",
        description: "",
        image: {
          id: 17,
          src: "http://localhost/spaalita/wp-content/uploads/2021/06/comfort_zone.jpg"
        },
        count: 80,
        children: [
          { _id: new ObjectId(), oId: 25, name: "Active Pureness", slug: "active-pureness", description: "", image: null, count: 5, children: [] },
          { _id: new ObjectId(), oId: 21, name: "Body Strategist", slug: "body-strategist", description: "", image: null, count: 11, children: [] },
          { _id: new ObjectId(), oId: 26, name: "Essential", slug: "essential", description: "", image: null, count: 7, children: [] },
          { _id: new ObjectId(), oId: 22, name: "Hydramemory", slug: "hydramemory", description: "", image: null, count: 12, children: [] },
          { _id: new ObjectId(), oId: 27, name: "Remedy", slug: "remedy", description: "", image: null, count: 6, children: [] },
          { _id: new ObjectId(), oId: 28, name: "Renight", slug: "renight", description: "", image: null, count: 6, children: [] },
          { _id: new ObjectId(), oId: 29, name: "Skin Regimen", slug: "skin-regimen", description: "", image: null, count: 6, children: [] },
          { _id: new ObjectId(), oId: 30, name: "Sublime Skin", slug: "sublime-skin", description: "", image: null, count: 13, children: [] },
          {
            _id: new ObjectId(),
            oId: 20,
            name: "Tranquillity",
            slug: "tranquillity",
            description: "",
            image: {
              id: 16,
              src: "http://localhost/spaalita/wp-content/uploads/2021/06/retail_products.jpg"
            },
            count: 13,
            children: []
          },
          { _id: new ObjectId(), oId: 65, name: "Sacred Nature", slug: "sacrednature", description: "Sacred Nature Products", image: null, count: 1, children: [] }
        ]
      },
      {
        _id: new ObjectId(),
        oId: 18,
        name: "Jane Iredale",
        slug: "jane-iradale",
        description: "",
        image: null,
        count: 76,
        children: [
          { _id: new ObjectId(), oId: 32, name: "Blushes, Highlighters & Bronzers", slug: "blushes-highlighters-bronzers", description: "", image: null, count: 10, children: [] },
          { _id: new ObjectId(), oId: 33, name: "Brows", slug: "brows", description: "", image: null, count: 1, children: [] },
          { _id: new ObjectId(), oId: 31, name: "Brushes Animal-Free Vegan", slug: "brushes-animal-free-vegan", description: "", image: null, count: 33, children: [] },
          { _id: new ObjectId(), oId: 34, name: "Concealers", slug: "concealers", description: "", image: null, count: 0, children: [] },
          { _id: new ObjectId(), oId: 47, name: "Cosmetic Bags", slug: "cosmetic-bags", description: "", image: null, count: 0, children: [] },
          { _id: new ObjectId(), oId: 35, name: "Eye Shadow", slug: "eye-shadow", description: "", image: null, count: 0, children: [] },
          { _id: new ObjectId(), oId: 36, name: "Eye Shadow Kits", slug: "eye-shadow-kits", description: "", image: null, count: 1, children: [] },
          { _id: new ObjectId(), oId: 37, name: "Eyeliner", slug: "eyeliner", description: "", image: null, count: 0, children: [] },
          { _id: new ObjectId(), oId: 38, name: "Foundation", slug: "foundation", description: "", image: null, count: 3, children: [] },
          { _id: new ObjectId(), oId: 39, name: "Hydration Sprays", slug: "hydration-sprays", description: "", image: null, count: 11, children: [] },
          { _id: new ObjectId(), oId: 40, name: "Lashes", slug: "lashes", description: "", image: null, count: 3, children: [] },
          { _id: new ObjectId(), oId: 41, name: "Lips", slug: "lips", description: "", image: null, count: 7, children: [] },
          { _id: new ObjectId(), oId: 42, name: "Makeup Kits", slug: "makeup-kits", description: "", image: null, count: 0, children: [] },
          { _id: new ObjectId(), oId: 43, name: "Oil Control", slug: "oil-control", description: "", image: null, count: 1, children: [] },
          { _id: new ObjectId(), oId: 44, name: "Pencil Sharpeners", slug: "pencil-sharpeners", description: "", image: null, count: 2, children: [] },
          { _id: new ObjectId(), oId: 45, name: "Primers", slug: "primers", description: "", image: null, count: 2, children: [] },
          { _id: new ObjectId(), oId: 46, name: "Skin & Body", slug: "skin-and-body", description: "", image: null, count: 3, children: [] }
        ]
      },
      { _id: new ObjectId(), oId: 19, name: "Footlogix", slug: "footlogix", description: "", image: null, count: 22, children: [] },
      { _id: new ObjectId(), oId: 48, name: "Gift Card", slug: "gift-card", description: "", image: null, count: 6, children: [] },
      { _id: new ObjectId(), oId: 15, name: "Uncategorized", slug: "uncategorized", description: "", image: null, count: 0, children: [] }
    ];
    // Insert into MongoDB
    await collection.insertMany(categories);
    console.log("Categories seeded successfully!");
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

seedCategories();