export interface DeskObjectDTO {
  id: number;
  objectName: string;
  posX: number;
  posY: number;
  isActive: boolean;
  volume: number;
  scale: number;
  imageData: string | null;
  variant: string | null;
}

export interface DeskObjectInput {
  objectName: string;
  posX: number;
  posY: number;
  isActive?: boolean;
  volume?: number;
  scale?: number;
  imageData?: string | null;
  variant?: string | null;
}
