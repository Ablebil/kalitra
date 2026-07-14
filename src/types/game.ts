export type CommandType = 'forward' | 'left' | 'right';

export type BlockItem = 
  | { id: string; type: CommandType }
  | { id: string; type: 'repeat'; count: number; children: BlockItem[] };

export interface ModalData {
  type: 'success' | 'fail';
  emoji: string;
  title: string;
  message: string;
  stars?: number;
}