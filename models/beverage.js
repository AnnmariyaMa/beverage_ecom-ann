//create class for beverages
class beverage {
    constructor(name,image,price,category,description,rating,quatity) {
        this.name = name;
        this.image = image;
        this.price = price;
        this.category = category;
        this.description = description;
        this.rating = rating;
        this.quatity = quatity;
  
        const timestamp = new Date().getTime();
        const random = Math.floor(Math.random() * 1000);
        this.id = timestamp + "" + random.toString().padStart(3, '0');
    }
}
module.exports = { beverage };