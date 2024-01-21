const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function calculateDiscount(cart, discounts) {
    let maxDiscount = { name: '', amount: 0 };

    for (const discount of discounts) {
        const discountAmount = discount.apply(cart);
        if (discountAmount > maxDiscount.amount) {
            maxDiscount = { name: discount.name, amount: discountAmount };
        }
    }

    return maxDiscount;
}

function flat10Discount(cart) {
    return cart.total > 200 ? 10 : 0;
}

function bulk5Discount(cart) {
    for (const product of cart.products) {
        if (product.quantity > 10) {
            return product.price * 0.05 * product.quantity;
        }
    }
    return 0;
}

function bulk10Discount(cart) {
    return cart.totalQuantity > 20 ? cart.total * 0.1 : 0;
}

function tiered50Discount(cart) {
    if (cart.totalQuantity > 30) {
        const eligibleProducts = cart.products.filter(product => product.quantity > 15);
        const discountAmount = eligibleProducts.reduce((acc, product) => {
            const unitsAbove15 = product.quantity - 15;
            return acc + (unitsAbove15 * product.price * 0.5);
        }, 0);

        return discountAmount;
    }
    return 0;
}

function calculateShippingFee(cart) {
    return Math.ceil(cart.totalQuantity / 10) * 5;
}

function calculateGiftWrapFee(cart) {
    return cart.products.reduce((acc, product) => acc + (product.isGift ? product.quantity : 0), 0);
}

function displayReceipt(cart, discount, shippingFee, giftWrapFee) {
    console.log('\nReceipt:');
    cart.products.forEach(product => {
        console.log(`${product.name} - Quantity: ${product.quantity} - Total: $${product.quantity * product.price}`);
    });

    console.log(`\nSubtotal: $${cart.total}`);
    console.log(`Discount Applied: ${discount.name} - Amount: $${discount.amount}`);
    console.log(`Shipping Fee: $${shippingFee}`);
    console.log(`Gift Wrap Fee: $${giftWrapFee}`);
    console.log(`\nTotal: $${cart.total - discount.amount + shippingFee + giftWrapFee}`);
}

function questionAsync(question) {
    return new Promise(resolve => {
        rl.question(question, resolve);
    });
}

async function getProductDetails(productName, price) {
    const quantity = await questionAsync(`Enter the quantity of ${productName}: `);
    const isGift = await questionAsync(`Is ${productName} wrapped as a gift? (yes/no): `);

    return {
        name: productName,
        quantity: parseInt(quantity),
        isGift: isGift.toLowerCase() === 'yes',
        price: price
    };
}

const discounts = [
    { name: 'flat_10_discount', apply: flat10Discount },
    { name: 'bulk_5_discount', apply: bulk5Discount },
    { name: 'bulk_10_discount', apply: bulk10Discount },
    { name: 'tiered_50_discount', apply: tiered50Discount }
];

(async () => {
    const products = [
        { ...await getProductDetails('Product A', 20), price: 20 },
        { ...await getProductDetails('Product B', 40), price: 40 },
        { ...await getProductDetails('Product C', 50), price: 50 }
    ];

    rl.close();
    const totalQuantity = products.reduce((acc, product) => acc + product.quantity, 0);
    const total = products.reduce((acc, product) => acc + (product.quantity * product.price), 0);
    const cart = { products, totalQuantity, total };
    const discountApplied = calculateDiscount(cart, discounts);
    const shippingFee = calculateShippingFee(cart);
    const giftWrapFee = calculateGiftWrapFee(cart);
    displayReceipt(cart, discountApplied, shippingFee, giftWrapFee);
})();
