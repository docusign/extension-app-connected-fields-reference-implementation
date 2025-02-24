import * as fs from 'fs';
import { parse } from 'csv-parse/sync';

type VehicleRow = {
    vin: string;
    stateOfRegistration: string;
    countryOfRegistration: string;
};

class VehicleDatabase implements IFileDb<VehicleRow> {
    csvFilePath: string;

    constructor(filePath: string) {
        this.csvFilePath = filePath;
    }

    read(): VehicleRow[] {
        if (!this.csvFilePath) {
            throw new TypeError('Invalid file path');
        }
        
        const fileContent = fs.readFileSync(this.csvFilePath, 'utf-8');
        const records = parse(fileContent, { columns: true, skip_empty_lines: true });

        return records as VehicleRow[];
    }

    findRecord(identifier: keyof VehicleRow, value: string): VehicleRow | undefined {
        const vehicles = this.read();
        return vehicles.find(vehicle => vehicle[identifier].toString() === value);
    }
}

export default VehicleDatabase;