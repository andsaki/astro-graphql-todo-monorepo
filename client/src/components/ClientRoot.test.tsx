import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import ClientRoot from './ClientRoot';
import { SortOrder } from '../generated/types';

// Appコンポーネントをモック化し、レンダリング時にエラーをスローさせる
vi.mock('./App', () => ({
  default: () => {
    throw new Error("I am a crash test dummy");
  }
}));

describe('ClientRoot', () => {
  it('子コンポーネントでエラーが発生した際に、エラーバウンダリのフォールバックUIが表示されること', () => {
    // react-error-boundaryライブラリはエラーをコンソールに出力するため、
    // テスト実行中はそれを一時的に無効化する
    const spy = vi.spyOn(console, 'error');
    spy.mockImplementation(() => {});

    render(<ClientRoot initialTerm="" initialSort={SortOrder.Asc} />);

    // フォールバックUIが表示されているかを確認
    expect(screen.getByText("Something went wrong:")).toBeInTheDocument();
    // 発生させたエラーのメッセージが表示されているかを確認
    expect(screen.getByText("I am a crash test dummy")).toBeInTheDocument();

    // 無効化したconsole.errorを元に戻す
    spy.mockRestore();
  });
});