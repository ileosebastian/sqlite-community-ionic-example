import { UUID } from "./types";

export interface User {
  id: string;
  name: string;
  active: number;
};


export interface Preference {
    checked: boolean;
}


export interface Grid {
    columns: number;
    rows: number;

    widthTiles: number;
    heightTiles: number;

    stage: Sample;
}

export interface Sample {
  name: string;
  love: string;
}

export interface Plane extends Grid {
    id?: string;
    floor: number;
    wayPoints: string;
    uuid: UUID;
    buildingId: UUID;
}

export interface PlaneParsed {
    id?: string;
    columns: number;
    rows: number;

    widthTiles: number;
    heightTiles: number;

    stage: string;

    uuid: UUID;
    floor: number;
    waypoints: string;
    buildingId: UUID

    published: boolean;
}