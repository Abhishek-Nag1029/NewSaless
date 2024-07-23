import React, { useState } from 'react';
import './ind.css';

type Unit = 'metric' | 'imperial';

const BMICalculator: React.FC = () => {
  const [weight, setWeight] = useState<number | ''>(0);
  const [height, setHeight] = useState<number | ''>(0);
  const [unit, setUnit] = useState<Unit>('metric');
  const [bmi, setBMI] = useState<number | ''>('');
  const [bmiCategory, setBMICategory] = useState<string>('');

  const calculateBMI = () => {
    if (weight && height) {
      let bmiValue = 0;

      if (unit === 'imperial') {
        // Calculate BMI in Imperial units (weight in lbs, height in inches)
        bmiValue = (weight* 703 / (height * height)) ;
      } else {
        // Calculate BMI in Metric units (weight in kg, height in meters)
        const heightInMeters = height / 100; // Convert height to meters
        bmiValue = weight / (heightInMeters * heightInMeters);
      }

      console.log(bmiValue);

      setBMI(bmiValue.toFixed(2));

      // Determine BMI category
      if (bmiValue < 18.5) {
        setBMICategory('Underweight');
      } else if (bmiValue < 24.9) {
        setBMICategory('Normal weight');
      } else if (bmiValue < 29.9) {
        setBMICategory('Overweight');
      } else {
        setBMICategory('Obesity');
      }
    } else {
      setBMI('');
      setBMICategory('-');
    }
  };

  return (
    <div className="layout-column align-items-center justify-content-start bmi-calculator" data-testid="bmi-calculator">
      <div className="bmi-calculator-scale card w-200 pt-30 pb-8 mt-20 mb-15">
        <section className="layout-row align-items-center justify-content-center mr-20 ml-20">
          <label htmlFor="weight">Weight:</label>
          <input
            type="number"
            id="weight"
            data-testid="weight-input"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value) || '')}
          />
          {unit === 'imperial' ? '(lbs)' : '(kg)'}
        </section>
        <section className="layout-row align-items-center justify-content-center mt-20 mr-20 ml-20">
          <label htmlFor="height">Height:</label>
          <input
            type="number"
            id="height"
            data-testid="height-input"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value) || '')}
          />
          {unit === 'imperial' ? '(in)' : '(m)'}
        </section>
        <section className="layout-row align-items-center justify-content-center mt-20 mr-20 ml-20">
          <label htmlFor="unit">Unit:</label>
          <select
            id="unit"
            data-testid="unit-selector"
            value={unit}
            onChange={(e) => setUnit(e.target.value as Unit)}
          >
            <option value="metric">Metric</option>
            <option value="imperial">Imperial</option>
          </select>
        </section>
        <section className="layout-row align-items-center justify-content-center mt-20 mr-20 ml-20">
          <button data-testid="calculate-button" onClick={calculateBMI}>
            Calculate
          </button>
        </section>
      </div>
      <div className="bmi-calculator-result card w-200 mt-10 pt-10 pb-10">
        <section className="layout-row align-items-center justify-content-center pl-50 pr-50">
          <p data-testid="bmi-result">BMI: {bmi ? `${bmi}` : '-'}</p>
        </section>
        <section className="layout-row align-items-center justify-content-center pl-50 pr-50">
          <p data-testid="bmi-category">Category: {bmiCategory}</p>
        </section>
      </div>
    </div>
  );
};

export default BMICalculator;
