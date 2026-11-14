import { useState } from "react";
import Breadcrumbs from "../components/seo/Breadcrumbs";
import SeoHead from "../components/seo/SeoHead";
import { contactAPI } from "../services/api";
import { SITE_URL } from "../data/site";

const Contact = () => {
  const [values, setValues] = useState({ name: "", email: "", message: "", website: "" });
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const canonical = `${SITE_URL}/contact/`;
  const title = "Contact TripSathi | Get in Touch";
  const description =
    "Contact the TripSathi team with questions, feedback, or a request about your account or travel-planning data.";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "sending", message: "" });
    try {
      const response = await contactAPI.submit(values);
      setStatus({
        type: "success",
        message:
          response.data.message ||
          "Your message has been sent. Thank you for contacting TripSathi.",
      });
      setValues({ name: "", email: "", message: "", website: "" });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error.response?.data?.message ||
          "We could not send your message. Please try again later.",
      });
    }
  };

  return (
    <>
      <SeoHead title={title} description={description} canonical={canonical} />
      <main className="page-bg py-8 md:py-12">
        <div className="page-container max-w-3xl">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Contact" }]} />
          <p className="section-label mb-3">We would like to hear from you</p>
          <h1 className="text-4xl font-bold md:text-5xl">Contact TripSathi</h1>
          <p className="mt-4 leading-7 text-text-secondary">
            Send a question, share feedback, or ask about account and itinerary
            data. Do not include passwords, payment details, or other sensitive
            information in this form.
          </p>

          <form onSubmit={handleSubmit} className="surface-card mt-8 space-y-5 p-6 md:p-8">
            <div>
              <label htmlFor="contact-name" className="mb-2 block text-sm font-semibold">
                Name
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                required
                minLength={2}
                maxLength={100}
                autoComplete="name"
                value={values.name}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="mb-2 block text-sm font-semibold">
                Email
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                required
                maxLength={254}
                autoComplete="email"
                value={values.email}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label htmlFor="contact-message" className="mb-2 block text-sm font-semibold">
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                required
                minLength={10}
                maxLength={5000}
                rows={7}
                value={values.message}
                onChange={handleChange}
                className="input resize-y"
              />
            </div>
            <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true">
              <label htmlFor="contact-website">Leave this field empty</label>
              <input
                id="contact-website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={values.website}
                onChange={handleChange}
              />
            </div>
            {status.message && (
              <p
                role={status.type === "error" ? "alert" : "status"}
                className={
                  status.type === "error"
                    ? "text-sm font-medium text-error"
                    : "text-sm font-medium text-success"
                }
              >
                {status.message}
              </p>
            )}
            <button type="submit" className="btn-primary" disabled={status.type === "sending"}>
              {status.type === "sending" ? "Sending…" : "Send message"}
            </button>
          </form>
          <p className="mt-4 text-sm leading-6 text-text-secondary">
            Contact delivery requires the server's SMTP environment variables
            to be configured. If submission reports that the service is
            unavailable, please try again later.
          </p>
        </div>
      </main>
    </>
  );
};

export default Contact;
