// app/contact/page.tsx
export default function Contact() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-gray-600">
            Need help with your account or interested in our services?
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Get in Touch</h3>
              <div className="space-y-3 text-gray-600">
                <p>📧 hello@apexdigitalafrica.com</p>
                <p>🌍 apexdigitalafrica.com</p>
                <p>📍 Lagos, Nigeria</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Support Hours</h3>
              <div className="space-y-2 text-gray-600">
                <p>Monday - Friday: 9AM - 6PM WAT</p>
                <p>Weekend: Emergency support only</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <p className="text-center text-gray-600">
              Please email us directly at{' '}
              <a href="mailto:hello@apexdigitalafrica.com" className="text-blue-600 hover:text-blue-500 font-medium">
                hello@apexdigitalafrica.com
              </a>
              {' '}for immediate assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}