import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createLander } from "../../redux/landerSlice";
import { selectThemeColors } from "@/features/theme/themeSlice";
import Button from "@/shared/components/Button";
import Input from "@/shared/components/Input";
import Spinner from "@/shared/components/Spinner";
import { ArrowLeft, ArrowRight, Sparkles, CheckCircle, Edit, Activity } from "lucide-react";

const STEPS = [
  { id: 1, name: "Basic Info", icon: Edit },
  { id: 2, name: "Design", icon: Sparkles },
  { id: 3, name: "Tracking", icon: Activity },
  { id: 4, name: "Review", icon: CheckCircle }
];

const CreateLanderPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useSelector(selectThemeColors);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    audience: "",
    template: "crypto-modern",
    domain: "",
    path: "",
    headline: "",
    subheadline: "",
    ctaText: "",
    features: {
      testimonials: true,
      trustBadges: true,
      video: false,
      countdown: false,
      faq: false
    }
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFeatureToggle = (feature) => {
    setFormData((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: !prev.features[feature]
      }
    }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      await dispatch(createLander(formData)).unwrap();
      navigate("/lander");
    } catch (error) {
      console.error("Failed to create lander:", error);
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: theme.bgMain }}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate("/lander")}
          className="flex items-center gap-2 font-medium transition-opacity hover:opacity-70"
          style={{ color: theme.textSecondary }}
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Landers
        </button>

        {/* Header */}
        <div
          className="rounded-xl p-6"
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.borderSubtle}`,
            boxShadow: theme.shadowCard
          }}
        >
          <h1 className="text-3xl font-bold mb-2" style={{ color: theme.textPrimary }}>
            Create New Lander
          </h1>
          <p className="text-sm" style={{ color: theme.textSecondary }}>
            Fill out the form below to automatically generate and deploy a new landing page
          </p>

          {/* Steps */}
          <div className="mt-6 flex items-center justify-between">
            {STEPS.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <React.Fragment key={step.id}>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all"
                      style={{
                        backgroundColor: currentStep >= step.id ? theme.blue : theme.bgMuted,
                        color: currentStep >= step.id ? "#FFFFFF" : theme.textTertiary,
                        boxShadow: currentStep >= step.id ? `0 4px 12px ${theme.blue}30` : "none"
                      }}
                    >
                      {currentStep > step.id ? <CheckCircle className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                    </div>
                    <div>
                      <p
                        className="font-medium text-sm"
                        style={{ color: currentStep >= step.id ? theme.textPrimary : theme.textTertiary }}
                      >
                        {step.name}
                      </p>
                    </div>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div
                      className="flex-1 h-1 mx-4 rounded"
                      style={{
                        backgroundColor: currentStep > step.id ? theme.blue : theme.borderSubtle
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div
          className="rounded-xl p-8"
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.borderSubtle}`,
            boxShadow: theme.shadowCard
          }}
        >
          {currentStep === 1 && <StepOne formData={formData} onChange={handleInputChange} theme={theme} />}
          {currentStep === 2 && (
            <StepTwo
              formData={formData}
              onChange={handleInputChange}
              onFeatureToggle={handleFeatureToggle}
              theme={theme}
            />
          )}
          {currentStep === 3 && <StepThree formData={formData} onChange={handleInputChange} theme={theme} />}
          {currentStep === 4 && <StepFour formData={formData} theme={theme} />}

          {/* Navigation */}
          <div
            className="flex items-center justify-between mt-8 pt-6"
            style={{ borderTop: `1px solid ${theme.borderSubtle}` }}
          >
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              icon={<ArrowLeft className="w-4 h-4" />}
              style={{
                backgroundColor: theme.bgSecondary,
                borderColor: theme.borderSubtle,
                color: theme.textSecondary
              }}
            >
              Previous
            </Button>

            {currentStep < 4 ? (
              <Button
                variant="primary"
                onClick={handleNext}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
                style={{
                  background: `linear-gradient(135deg, ${theme.blue} 0%, ${theme.cyan} 100%)`,
                  color: "#FFFFFF",
                  border: "none"
                }}
              >
                Next: {STEPS[currentStep]?.name}
              </Button>
            ) : (
              <Button
                variant="success"
                onClick={handleSubmit}
                icon={<Sparkles className="w-4 h-4" />}
                style={{
                  background: `linear-gradient(135deg, ${theme.green} 0%, ${theme.cyan} 100%)`,
                  color: "#FFFFFF",
                  border: "none"
                }}
              >
                Create Lander
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Step Components
const StepOne = ({ formData, onChange, theme }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold mb-4" style={{ color: theme.textPrimary }}>
      Step 1: Basic Information
    </h2>

    <Input
      label="Lander Name"
      placeholder="e.g., Crypto-US-v1"
      value={formData.name}
      onChange={(e) => onChange("name", e.target.value)}
      required
    />

    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
        Target Audience <span style={{ color: theme.red }}>*</span>
      </label>
      <select
        value={formData.audience}
        onChange={(e) => onChange("audience", e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg focus:ring-2 transition-all"
        style={{
          backgroundColor: theme.inputBg,
          border: `1px solid ${theme.borderSubtle}`,
          color: theme.textPrimary,
          outline: "none"
        }}
      >
        <option value="">Select Audience</option>
        <option value="crypto">Crypto</option>
        <option value="finance">Finance</option>
        <option value="health">Health</option>
        <option value="ecommerce">E-commerce</option>
        <option value="business">Business</option>
      </select>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <Input
        label="Domain"
        placeholder="crypto-offer.com"
        value={formData.domain}
        onChange={(e) => onChange("domain", e.target.value)}
        required
      />
      <Input
        label="Deploy Path"
        placeholder="/landers/crypto-v1"
        value={formData.path}
        onChange={(e) => onChange("path", e.target.value)}
        required
      />
    </div>

    <div
      className="p-4 rounded-lg"
      style={{
        backgroundColor: theme.bgMuted,
        border: `1px solid ${theme.borderSubtle}`
      }}
    >
      <p className="text-sm mb-1" style={{ color: theme.textSecondary }}>
        Full URL:
      </p>
      <p className="font-mono" style={{ color: theme.blue }}>
        https://{formData.domain || "domain.com"}
        {formData.path || "/path"}
      </p>
    </div>
  </div>
);

const StepTwo = ({ formData, onChange, onFeatureToggle, theme }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold mb-4" style={{ color: theme.textPrimary }}>
      Step 2: Design & Content
    </h2>

    <Input
      label="Headline"
      placeholder="Start Earning $500/Day with Crypto Trading"
      value={formData.headline}
      onChange={(e) => onChange("headline", e.target.value)}
      required
    />

    <Input
      label="Subheadline"
      placeholder="Join 50,000+ users already making passive income"
      value={formData.subheadline}
      onChange={(e) => onChange("subheadline", e.target.value)}
    />

    <Input
      label="Primary CTA Text"
      placeholder="Get Started Free"
      value={formData.ctaText}
      onChange={(e) => onChange("ctaText", e.target.value)}
      required
    />

    <div>
      <label className="block text-sm font-medium mb-3" style={{ color: theme.textSecondary }}>
        Content Features
      </label>
      <div className="space-y-2">
        {Object.entries(formData.features).map(([key, value]) => (
          <label key={key} className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={value}
              onChange={() => onFeatureToggle(key)}
              className="w-5 h-5 rounded focus:ring-2"
              style={{
                accentColor: theme.blue
              }}
            />
            <span className="text-sm capitalize" style={{ color: theme.textPrimary }}>
              {key.replace(/([A-Z])/g, " $1").trim()}
            </span>
          </label>
        ))}
      </div>
    </div>
  </div>
);

const StepThree = ({ formData, onChange, theme }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold mb-4" style={{ color: theme.textPrimary }}>
      Step 3: Tracking & Integration
    </h2>
    <p style={{ color: theme.textSecondary }}>
      Tracking configuration options will appear here...
    </p>
  </div>
);

const StepFour = ({ formData, theme }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold mb-4" style={{ color: theme.textPrimary }}>
      Step 4: Review & Deploy
    </h2>
    <div
      className="p-6 rounded-lg space-y-4"
      style={{
        backgroundColor: theme.bgMuted,
        border: `1px solid ${theme.borderSubtle}`
      }}
    >
      <div>
        <p className="text-sm" style={{ color: theme.textSecondary }}>Name</p>
        <p className="font-semibold" style={{ color: theme.textPrimary }}>{formData.name}</p>
      </div>
      <div>
        <p className="text-sm" style={{ color: theme.textSecondary }}>URL</p>
        <p className="font-mono" style={{ color: theme.blue }}>
          https://{formData.domain}
          {formData.path}
        </p>
      </div>
      <div>
        <p className="text-sm" style={{ color: theme.textSecondary }}>Headline</p>
        <p style={{ color: theme.textPrimary }}>{formData.headline}</p>
      </div>
    </div>
  </div>
);

export default CreateLanderPage;
