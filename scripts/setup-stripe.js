// Script to create Stripe products and prices
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function setup() {
  try {
    console.log('Creating UniBrain Pro product...');
    
    // Create the product
    const product = await stripe.products.create({
      name: 'UniBrain Pro',
      description: 'Unlimited courses, unlimited file uploads, and priority AI processing',
    });
    
    console.log('Product created:', product.id);
    
    // Create monthly price
    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 999, // $9.99 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
    });
    
    console.log('Monthly price created:', monthlyPrice.id);
    
    // Create yearly price
    const yearlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 9999, // $99.99 in cents
      currency: 'usd',
      recurring: {
        interval: 'year',
      },
    });
    
    console.log('Yearly price created:', yearlyPrice.id);
    
    console.log('\n✅ Setup complete! Add these to your .env.local:\n');
    console.log(`STRIPE_PRO_MONTHLY_PRICE_ID=${monthlyPrice.id}`);
    console.log(`STRIPE_PRO_YEARLY_PRICE_ID=${yearlyPrice.id}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

setup();

