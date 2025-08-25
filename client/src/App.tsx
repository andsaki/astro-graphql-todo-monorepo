import xs from 'xstream';
import { div } from '@cycle/dom';

export function App() {
  const vdom$ = xs.of(
    div(['Hello Cycle.js'])
  );
  return {
    DOM: vdom$,
  };
}
