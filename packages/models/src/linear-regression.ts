/**
 * Linear regression model
 */

import { Model } from './types';
import { MathUtils } from '@meridianalgo/utils';

export class LinearRegressionModel implements Model {
  private weights: number[] = [];
  private bias: number = 0;
  
  async train(features: number[][], labels: number[]): Promise<void> {
    const n = features.length;
    const m = features[0].length;
    
    // Add bias term
    const X = features.map(row => [1, ...row]);
    
    // Normal equation: theta = (X^T X)^-1 X^T y
    const XtX = this.matrixMultiply(this.transpose(X), X);
    const XtY = this.matrixVectorMultiply(this.transpose(X), labels);
    
    // Solve using simple inversion (for small matrices)
    const theta = this.solveLinearSystem(XtX, XtY);
    
    this.bias = theta[0];
    this.weights = theta.slice(1);
  }
  
  async predict(features: number[][]): Promise<number[]> {
    return features.map(row => {
      let prediction = this.bias;
      for (let i = 0; i < this.weights.length; i++) {
        prediction += this.weights[i] * row[i];
      }
      return prediction;
    });
  }
  
  featureImportance(): number[] {
    return this.weights.map(w => Math.abs(w));
  }
  
  private transpose(matrix: number[][]): number[][] {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const result: number[][] = [];
    
    for (let j = 0; j < cols; j++) {
      const row: number[] = [];
      for (let i = 0; i < rows; i++) {
        row.push(matrix[i][j]);
      }
      result.push(row);
    }
    
    return result;
  }
  
  private matrixMultiply(A: number[][], B: number[][]): number[][] {
    const rowsA = A.length;
    const colsA = A[0].length;
    const colsB = B[0].length;
    const result: number[][] = [];
    
    for (let i = 0; i < rowsA; i++) {
      const row: number[] = [];
      for (let j = 0; j < colsB; j++) {
        let sum = 0;
        for (let k = 0; k < colsA; k++) {
          sum += A[i][k] * B[k][j];
        }
        row.push(sum);
      }
      result.push(row);
    }
    
    return result;
  }
  
  private matrixVectorMultiply(A: number[][], v: number[]): number[] {
    return A.map(row => row.reduce((sum, val, i) => sum + val * v[i], 0));
  }
  
  private solveLinearSystem(A: number[][], b: number[]): number[] {
    // Gaussian elimination with partial pivoting
    const n = A.length;
    const augmented = A.map((row, i) => [...row, b[i]]);
    
    // Forward elimination
    for (let i = 0; i < n; i++) {
      // Find pivot
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = k;
        }
      }
      
      // Swap rows
      [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
      
      // Eliminate column
      for (let k = i + 1; k < n; k++) {
        const factor = augmented[k][i] / augmented[i][i];
        for (let j = i; j <= n; j++) {
          augmented[k][j] -= factor * augmented[i][j];
        }
      }
    }
    
    // Back substitution
    const x: number[] = new Array(n);
    for (let i = n - 1; i >= 0; i--) {
      x[i] = augmented[i][n];
      for (let j = i + 1; j < n; j++) {
        x[i] -= augmented[i][j] * x[j];
      }
      x[i] /= augmented[i][i];
    }
    
    return x;
  }
}
