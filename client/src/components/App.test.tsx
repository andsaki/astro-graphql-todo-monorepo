import { render, screen, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing/react';
import App from './App';
import { SortOrder } from '../generated/types';

describe('App', () => {
  it('Appコンポーネントがレンダリングされること', () => {
    render(
      <MockedProvider mocks={[]}>
        <App initialTerm="" initialSort={SortOrder.Asc} />
      </MockedProvider>
    );

    expect(screen.getByText('Todo App')).toBeInTheDocument();
  });
});
