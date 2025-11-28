import axios from "axios";
import { ShoppingBag, Wallet, CreditCard, Smartphone } from "lucide-react";
import { useState } from "react";

type PaymentMethod = "card" | "paymaya" | "gcash";

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
}

export interface Order {
  id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  amount: number;
  currency: string;
  product_name: string;
  product_description?: string;
  payment_intent_id?: string;
  payment_method_id?: string;
  status: "pending" | "processing" | "succeeded" | "failed";
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

const PACKAGES: Package[] = [
  {
    id: "starter",
    name: "Starter Pack",
    description: "Perfect for getting started",
    price: 29900,
    features: [
      "Basic features",
      "5 GB storage",
      "Email support",
      "1 user account",
    ],
  },
  {
    id: "pro",
    name: "Pro Pack",
    description: "For growing businesses",
    price: 79900,
    features: [
      "Advanced features",
      "100 GB storage",
      "Priority support",
      "10 user accounts",
      "Analytics",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise Pack",
    description: "For large organizations",
    price: 199900,
    features: [
      "All features",
      "Unlimited storage",
      "24/7 support",
      "Unlimited users",
      "Advanced analytics",
      "API access",
    ],
  },
];

const PaymongoTest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package>(PACKAGES[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvc: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const orderData: Omit<Order, "id" | "created_at" | "updated_at"> = {
        customer_name: formData.customerName,
        customer_email: formData.customerEmail,
        customer_phone: formData.customerPhone || undefined,
        amount: selectedPackage.price,
        currency: "PHP",
        product_name: selectedPackage.name,
        product_description: selectedPackage.description,
        status: "pending",
      };

      const paymentData = {
        method: paymentMethod,
        card:
          paymentMethod === "card"
            ? {
                number: formData.cardNumber.replace(/\s/g, ""),
                exp_month: parseInt(formData.expiryMonth),
                exp_year: parseInt(formData.expiryYear),
                cvc: formData.cvc,
              }
            : undefined,
        billing: {
          name: formData.customerName,
          email: formData.customerEmail,
          phone: formData.customerPhone,
        },
      };

      const response = await axios.post(`/api/package/process-payment`, {
        order: orderData,
        payment: paymentData,
      });

      const result = await response.data;

      console.log("result; ", result);

      if (!response.data) {
        throw new Error(result.error || "Payment failed");
      }

      if (result.status === "awaiting_next_action" && result.redirect_url) {
        window.location.href = result.redirect_url;
        return;
      }

      if (result.status === "succeeded") {
        setSuccess(true);
        setFormData({
          customerName: "",
          customerEmail: "",
          customerPhone: "",
          cardNumber: "",
          expiryMonth: "",
          expiryYear: "",
          cvc: "",
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-emerald-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase. A confirmation email has been sent.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            Make Another Purchase
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Choose Your Package
          </h1>
          <p className="text-gray-600">
            Select the perfect plan for your needs
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => setSelectedPackage(pkg)}
              className={`rounded-2xl p-8 cursor-pointer transition-all ${
                selectedPackage.id === pkg.id
                  ? "bg-blue-600 text-white shadow-2xl scale-105"
                  : "bg-white text-gray-900 shadow-lg hover:shadow-xl"
              }`}
            >
              <h3
                className={`text-2xl font-bold mb-2 ${
                  selectedPackage.id === pkg.id ? "text-white" : "text-gray-900"
                }`}
              >
                {pkg.name}
              </h3>
              <p
                className={`text-sm mb-4 ${
                  selectedPackage.id === pkg.id
                    ? "text-blue-100"
                    : "text-gray-600"
                }`}
              >
                {pkg.description}
              </p>
              <div className="mb-6">
                <span
                  className={`text-4xl font-bold ${
                    selectedPackage.id === pkg.id
                      ? "text-white"
                      : "text-blue-600"
                  }`}
                >
                  ₱{(pkg.price / 100).toFixed(2)}
                </span>
              </div>
              <ul className="space-y-3">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Order Summary
              </h2>
            </div>

            <div className="border-2 border-blue-100 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {selectedPackage.name}
              </h3>
              <p className="text-gray-600 mb-4">
                {selectedPackage.description}
              </p>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₱{(selectedPackage.price / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Fee</span>
                  <span>₱0.00</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>₱{(selectedPackage.price / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  {/* <Lock className="w-5 h-5 text-blue-600 mt-0.5" /> */}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Secure Payment
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Your payment information is encrypted and secure
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Wallet className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Payment Method
              </h2>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-3 gap-3 mb-8">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === "card"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <CreditCard
                    className={`w-6 h-6 mx-auto mb-2 ${
                      paymentMethod === "card"
                        ? "text-blue-600"
                        : "text-gray-600"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium block ${
                      paymentMethod === "card"
                        ? "text-blue-600"
                        : "text-gray-700"
                    }`}
                  >
                    Card
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("paymaya")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === "paymaya"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Smartphone
                    className={`w-6 h-6 mx-auto mb-2 ${
                      paymentMethod === "paymaya"
                        ? "text-blue-600"
                        : "text-gray-600"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium block ${
                      paymentMethod === "paymaya"
                        ? "text-blue-600"
                        : "text-gray-700"
                    }`}
                  >
                    PayMaya
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("gcash")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === "gcash"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Wallet
                    className={`w-6 h-6 mx-auto mb-2 ${
                      paymentMethod === "gcash"
                        ? "text-blue-600"
                        : "text-gray-600"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium block ${
                      paymentMethod === "gcash"
                        ? "text-blue-600"
                        : "text-gray-700"
                    }`}
                  >
                    GCash
                  </span>
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Juan Dela Cruz"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="juan@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="+63 912 345 6789"
                />
              </div>

              {paymentMethod === "card" && (
                <div className="border-t border-gray-200 pt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      required
                      maxLength={19}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="4123 4567 8901 2345"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Month
                      </label>
                      <input
                        type="text"
                        name="expiryMonth"
                        value={formData.expiryMonth}
                        onChange={handleInputChange}
                        required
                        maxLength={2}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="12"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Year
                      </label>
                      <input
                        type="text"
                        name="expiryYear"
                        value={formData.expiryYear}
                        onChange={handleInputChange}
                        required
                        maxLength={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="2025"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVC
                      </label>
                      <input
                        type="text"
                        name="cvc"
                        value={formData.cvc}
                        onChange={handleInputChange}
                        required
                        maxLength={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="123"
                      />
                    </div>
                  </div>
                </div>
              )}

              {(paymentMethod === "paymaya" || paymentMethod === "gcash") && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      You will be redirected to{" "}
                      {paymentMethod === "paymaya" ? "PayMaya" : "GCash"} to
                      complete your payment securely.
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    {/* <Lock className="w-5 h-5" /> */}
                    Pay ₱{(selectedPackage.price / 100).toFixed(2)}
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                By clicking "Pay", you agree to our terms and conditions. Your
                payment is secured by Paymongo.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymongoTest;
