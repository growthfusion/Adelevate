import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createTest } from "../../redux/abtestSlice";
import { selectThemeColors } from "@/features/theme/themeSlice";
import Button from "@/shared/components/Button";
import Input from "@/shared/components/Input";
import Select from "@/shared/components/Select";
import { ArrowLeft, Sparkles, FlaskConical } from "lucide-react";

const CreateABTestPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useSelector(selectThemeColors);

  const [formData, setFormData] = useState({
    name: "",
    landerId: "",
    type: "cta",
    controlValue: "",
    variantValue: "",
    trafficSplit: 50,
    targetConversions: 1000,
    duration: 14
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createTest(formData)).unwrap();
      navigate("/ab-tests");
    } catch (error) {
      console.error("Failed to create test:", error);
    }
  };

  const testTypes = [
    { value: "cta", label: "CTA Text" },
    { value: "headline", label: "Headline" },
    { value: "design", label: "Design Element" },
    { value: "layout", label: "Layout" },
    { value: "image", label: "Image/Video" },
    { value: "form", label: "Form Fields" }
  ];

  const landers = [
    { value: "1", label: "Crypto-US-v3" },
    { value: "2", label: "Finance-EU-v2" },
    { value: "3", label: "Health-US-v1" }
  ];

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: theme.bgMain }}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate("/ab-tests")}
          className="flex items-center gap-2 font-medium transition-opacity hover:opacity-70"
          style={{ color: theme.textSecondary }}
        >
          <ArrowLeft className="w-5 h-5" />
          Back to A/B Tests
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
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${theme.purple}20 0%, ${theme.blue}20 100%)`,
                border: `1px solid ${theme.purple}30`
              }}
            >
              <FlaskConical className="w-6 h-6" style={{ color: theme.purple }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: theme.textPrimary }}>
                Create New A/B Test
              </h1>
              <p className="text-sm mt-1" style={{ color: theme.textSecondary }}>
                Set up a split test to optimize your landing page performance
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div
            className="rounded-xl p-6 space-y-6"
            style={{
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.borderSubtle}`,
              boxShadow: theme.shadowCard
            }}
          >
            <h2 className="text-lg font-semibold" style={{ color: theme.textPrimary }}>
              Test Configuration
            </h2>

            <Input
              label="Test Name"
              placeholder="e.g., Hero CTA Text Test"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />

            <Select
              label="Lander"
              options={landers}
              value={formData.landerId}
              onChange={(e) => handleChange("landerId", e.target.value)}
              placeholder="Select a lander"
              required
            />

            <Select
              label="Test Type"
              options={testTypes}
              value={formData.type}
              onChange={(e) => handleChange("type", e.target.value)}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Control Value"
                placeholder="Original value"
                value={formData.controlValue}
                onChange={(e) => handleChange("controlValue", e.target.value)}
                required
              />
              <Input
                label="Variant Value"
                placeholder="New value to test"
                value={formData.variantValue}
                onChange={(e) => handleChange("variantValue", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
                  Traffic Split
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={formData.trafficSplit}
                    onChange={(e) => handleChange("trafficSplit", parseInt(e.target.value))}
                    className="flex-1"
                    style={{
                      accentColor: theme.blue
                    }}
                  />
                  <span className="text-sm font-medium w-16 text-center" style={{ color: theme.textPrimary }}>
                    {formData.trafficSplit}/{100 - formData.trafficSplit}
                  </span>
                </div>
              </div>

              <Input
                label="Target Conversions"
                type="number"
                placeholder="1000"
                value={formData.targetConversions}
                onChange={(e) => handleChange("targetConversions", parseInt(e.target.value))}
                required
              />

              <Input
                label="Max Duration (days)"
                type="number"
                placeholder="14"
                value={formData.duration}
                onChange={(e) => handleChange("duration", parseInt(e.target.value))}
                required
              />
            </div>

            {/* Preview */}
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: theme.bgMuted,
                border: `1px solid ${theme.borderSubtle}`
              }}
            >
              <h3 className="text-sm font-semibold mb-3" style={{ color: theme.textSecondary }}>
                Test Preview
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className="p-3 rounded"
                  style={{
                    backgroundColor: theme.bgCard,
                    border: `1px solid ${theme.borderSubtle}`
                  }}
                >
                  <p className="text-xs mb-1" style={{ color: theme.textSecondary }}>
                    Control ({formData.trafficSplit}%)
                  </p>
                  <p className="font-medium" style={{ color: theme.textPrimary }}>
                    {formData.controlValue || "Not set"}
                  </p>
                </div>
                <div
                  className="p-3 rounded"
                  style={{
                    backgroundColor: `${theme.blue}15`,
                    border: `1px solid ${theme.blue}40`
                  }}
                >
                  <p className="text-xs mb-1" style={{ color: theme.blue }}>
                    Variant ({100 - formData.trafficSplit}%)
                  </p>
                  <p className="font-medium" style={{ color: theme.textPrimary }}>
                    {formData.variantValue || "Not set"}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div
              className="flex items-center justify-end gap-3 pt-6"
              style={{ borderTop: `1px solid ${theme.borderSubtle}` }}
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/ab-tests")}
                style={{
                  backgroundColor: theme.bgSecondary,
                  borderColor: theme.borderSubtle,
                  color: theme.textSecondary
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                icon={<Sparkles className="w-4 h-4" />}
                style={{
                  background: `linear-gradient(135deg, ${theme.purple} 0%, ${theme.blue} 100%)`,
                  color: "#FFFFFF",
                  border: "none"
                }}
              >
                Create & Start Test
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateABTestPage;
