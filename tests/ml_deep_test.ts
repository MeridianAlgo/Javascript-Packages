/**
 * Deep Test for Machine Learning Components
 */

import { LSTMCell, randomLSTMWeights } from '../src/ml/lstm';
import { walkForward } from '../src/ml/walk-forward';

async function main() {
  console.log('🧠 MeridianAlgo Machine Learning Test\n');

  try {
    // 1. LSTM Forward Pass
    console.log('[1/2] LSTM Inference');
    const inputSize = 5;
    const hiddenSize = 10;
    const weights = randomLSTMWeights(inputSize, hiddenSize);
    const cell = new LSTMCell(weights);
    
    const sequence = Array.from({ length: 10 }, () => 
      Array.from({ length: inputSize }, () => Math.random())
    );
    
    const { h, c } = cell.forward(sequence);
    console.log(`  - LSTM Output (h[0]): ${h[0].toFixed(4)}`);
    console.log(`  - Cell State (c[0]): ${c[0].toFixed(4)}`);
    console.log();

    // 2. Walk-Forward Validation
    console.log('[2/2] Walk-Forward Validation');
    const X = Array.from({ length: 100 }, () => [Math.random(), Math.random()]);
    const y = Array.from({ length: 100 }, () => Math.random());
    
    const walkResult = walkForward(X, y, {
      mode: 'expanding',
      initialTrainSize: 50,
      testSize: 10,
      step: 10,
      fit: (Xtrain, ytrain) => {
        // Mock fit: return mean of ytrain
        return ytrain.reduce((a, b) => a + b, 0) / ytrain.length;
      },
      predict: (model, Xtest) => {
        // Mock predict: return model (which is the mean) for all inputs
        return Xtest.map(() => model as number);
      }
    });
    
    console.log(`  - WF Folds: ${walkResult.folds.length}`);
    console.log(`  - Combined Predictions: ${walkResult.combinedPredictions.length}`);
    console.log(`  - Mean MSE: ${walkResult.meanMse.toFixed(4)}`);
    
    console.log();
    console.log('✅ ML Test Complete!');
  } catch (err) {
    console.error('❌ ML Test Failed:');
    console.error(err);
    process.exit(1);
  }
}

main();
