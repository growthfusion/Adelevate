import React, { useState } from 'react';
//import Icon from '../../../components/AppIcon';
import {Button} from '@/components/ui/Button';

import { Input } from "@/components/ui/input";


const CustomMetricCalculator = ({ isOpen, onClose }) => {
  const [metricName, setMetricName] = useState('');
  const [formula, setFormula] = useState('');
  const [description, setDescription] = useState('');
  const [selectedOperands, setSelectedOperands] = useState([]);
  const [calculatedValue, setCalculatedValue] = useState(null);

  const availableMetrics = [
    { value: 'spend', label: 'Amount Spent', symbol: 'S' },
    { value: 'revenue', label: 'Revenue', symbol: 'R' },
    { value: 'conversions', label: 'Conversions', symbol: 'C' },
    { value: 'clicks', label: 'Clicks', symbol: 'Cl' },
    { value: 'impressions', label: 'Impressions', symbol: 'I' },
    { value: 'cpa', label: 'Cost Per Acquisition', symbol: 'CPA' },
    { value: 'ctr', label: 'Click-Through Rate', symbol: 'CTR' },
    { value: 'conversion_rate', label: 'Conversion Rate', symbol: 'CR' }
  ];

  const operators = [
    { value: '+', label: 'Add (+)' },
    { value: '-', label: 'Subtract (-)' },
    { value: '*', label: 'Multiply (×)' },
    { value: '/', label: 'Divide (÷)' },
    { value: '(', label: 'Open Parenthesis' },
    { value: ')', label: 'Close Parenthesis' }
  ];

  const presetFormulas = [
    {
      name: 'Profit Margin',
      formula: '(R - S) / R * 100',
      description: 'Percentage of revenue that represents profit'
    },
    {
      name: 'Cost Per Click',
      formula: 'S / Cl',
      description: 'Average cost for each click received'
    },
    {
      name: 'Revenue Per Click',
      formula: 'R / Cl',
      description: 'Average revenue generated per click'
    },
    {
      name: 'Efficiency Score',
      formula: '(C / S) * (CTR * 100)',
      description: 'Combined efficiency metric based on conversions and CTR'
    },
    {
      name: 'Value Per Impression',
      formula: 'R / I * 1000',
      description: 'Revenue generated per 1000 impressions (RPM)'
    }
  ];

  const mockData = {
    spend: 15420.50,
    revenue: 52340.20,
    conversions: 342,
    clicks: 8540,
    impressions: 245600,
    cpa: 45.09,
    ctr: 3.47,
    conversion_rate: 4.0
  };

  const addToFormula = (value) => {
    setFormula(prev => prev + value);
  };

  const clearFormula = () => {
    setFormula('');
    setCalculatedValue(null);
  };

  const calculateMetric = () => {
    try {
      // Replace metric symbols with actual values
      let evaluationFormula = formula;
      availableMetrics?.forEach(metric => {
        const regex = new RegExp(metric.symbol, 'g');
        evaluationFormula = evaluationFormula?.replace(regex, mockData?.[metric?.value]);
      });

      // Basic formula validation and calculation
      // In a real implementation, you'd use a proper expression parser
      const result = eval(evaluationFormula);
      setCalculatedValue(result);
    } catch (error) {
      setCalculatedValue('Error: Invalid formula');
    }
  };

  const applyPresetFormula = (preset) => {
    setMetricName(preset?.name);
    setFormula(preset?.formula);
    setDescription(preset?.description);
  };

  const saveCustomMetric = () => {
    if (!metricName || !formula) return;
    
    // In a real implementation, this would save to backend
    console.log('Saving custom metric:', {
      name: metricName,
      formula,
      description,
      value: calculatedValue
    });
    
    // Reset form
    setMetricName('');
    setFormula('');
    setDescription('');
    setCalculatedValue(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-modal w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="Calculator" size={20} className="text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Custom Metric Calculator</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} iconName="X" iconSize={16} />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Create custom metrics using mathematical formulas with available data points
          </p>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formula Builder */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Formula Builder</h4>
                
                <Input
                  label="Metric Name"
                  placeholder="Enter custom metric name"
                  value={metricName}
                  onChange={(e) => setMetricName(e?.target?.value)}
                  className="mb-3"
                />

                <div className="mb-3">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Formula
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="Build your formula using metrics and operators"
                      value={formula}
                      onChange={(e) => setFormula(e?.target?.value)}
                      className="font-mono"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFormula}
                      iconName="X"
                      iconSize={14}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    />
                  </div>
                </div>

                <Input
                  label="Description"
                  placeholder="Describe what this metric measures"
                  value={description}
                  onChange={(e) => setDescription(e?.target?.value)}
                />
              </div>

              {/* Available Metrics */}
              <div>
                <h5 className="text-sm font-medium text-foreground mb-2">Available Metrics</h5>
                <div className="grid grid-cols-2 gap-2">
                  {availableMetrics?.map(metric => (
                    <button
                      key={metric?.value}
                      onClick={() => addToFormula(metric?.symbol)}
                      className="flex items-center justify-between p-2 text-left border border-border rounded hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm text-foreground">{metric?.label}</span>
                      <span className="text-xs font-mono bg-primary/10 text-primary px-1 rounded">
                        {metric?.symbol}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Operators */}
              <div>
                <h5 className="text-sm font-medium text-foreground mb-2">Operators</h5>
                <div className="grid grid-cols-3 gap-2">
                  {operators?.map(operator => (
                    <button
                      key={operator?.value}
                      onClick={() => addToFormula(operator?.value)}
                      className="p-2 text-center border border-border rounded hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm font-mono text-foreground">{operator?.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview & Presets */}
            <div className="space-y-4">
              {/* Current Data Preview */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Current Data Values</h4>
                <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                  {availableMetrics?.map(metric => (
                    <div key={metric?.value} className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{metric?.label} ({metric?.symbol}):</span>
                      <span className="font-mono text-foreground">
                        {typeof mockData?.[metric?.value] === 'number' 
                          ? mockData?.[metric?.value]?.toLocaleString()
                          : mockData?.[metric?.value]
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculation Result */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Calculation Result</h4>
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Current Formula:</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={calculateMetric}
                      disabled={!formula}
                      iconName="Calculator"
                      iconSize={14}
                    >
                      Calculate
                    </Button>
                  </div>
                  <div className="font-mono text-sm text-foreground bg-muted/30 rounded p-2 mb-3">
                    {formula || 'No formula entered'}
                  </div>
                  {calculatedValue !== null && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {typeof calculatedValue === 'number' 
                          ? calculatedValue?.toLocaleString(undefined, { maximumFractionDigits: 2 })
                          : calculatedValue
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">Calculated Value</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Preset Formulas */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Preset Formulas</h4>
                <div className="space-y-2">
                  {presetFormulas?.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => applyPresetFormula(preset)}
                      className="w-full text-left p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="font-medium text-sm text-foreground">{preset?.name}</div>
                      <div className="text-xs font-mono text-primary mt-1">{preset?.formula}</div>
                      <div className="text-xs text-muted-foreground mt-1">{preset?.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Custom metrics will be available across all analytical views
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={saveCustomMetric}
                disabled={!metricName || !formula || calculatedValue === null}
                iconName="Save"
                iconPosition="left"
              >
                Save Metric
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomMetricCalculator;