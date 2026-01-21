import { Programadores } from "../../public/pages/programadores/programadores";
import { ProgramadoresService } from "../../services/programadores";

describe('Programadores', () => {
  it('should create an instance', () => {
    expect(new ProgramadoresService()).toBeTruthy();
  });
});
