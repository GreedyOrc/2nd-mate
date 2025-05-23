export class Rope {
    constructor(
        public dropTime: number,
        public startLocation: GeolocationPosition, 
        public endLocation: GeolocationPosition, 
        public catchtype: string,
        public colour: string,
        public depth: number,
        public rating?: string,
        public haulTime?: number
    ) {}
}


