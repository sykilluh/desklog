export interface DeskObjectDTO {
  id: number;
  objectName: string;
  posX: number;
  posY: number;
  isActive: boolean;
  volume: number;
  scale: number;
}

export interface DeskObjectInput {
  objectName: string;
  posX: number;
  posY: number;
  isActive?: boolean;
  volume?: number;
  scale?: number;
}
