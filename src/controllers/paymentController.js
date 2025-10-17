
import Payment from "../models/Payment.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

class paymentController {
  static async createStripePayment(req, res) {
    try {
      const { amount, currency = "mad" } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100,
        currency,
      });

      
      const payment = await Payment.create({
        user: req.user._id,
        amount,
        currency,
        stripePaymentId: paymentIntent.id,
        status: paymentIntent.status || "pending"
      });

      res.json({ clientSecret: paymentIntent.client_secret, paymentId: payment._id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default paymentController;
