export class Rope {
    constructor(
        public time: number,
        public live: boolean,
        public startLocation: GeolocationPosition, 
        public endLocation: GeolocationPosition, 
        public catchtype: string,
        public colour: string, 
        public rating?: string,
        public ropeid?: string
    ) {}
}


