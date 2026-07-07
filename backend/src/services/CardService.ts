export class CardService {

  private static getUniqueRandomNumbers(min: number, max: number, count: number): (number | string)[] {
    const numbers = new Set<number>();
    
    while (numbers.size < count) {
      const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
      numbers.add(randomNum);
    }
    
    return Array.from(numbers);
  }

  public static generateCard() {
    const b = this.getUniqueRandomNumbers(1, 15, 5);
    const i = this.getUniqueRandomNumbers(16, 30, 5);
    const n = this.getUniqueRandomNumbers(31, 45, 5);
    const g = this.getUniqueRandomNumbers(46, 60, 5);
    const o = this.getUniqueRandomNumbers(61, 75, 5);

    
    n[2] = "FREE";

   
    return {
      B: b,
      I: i,
      N: n,
      G: g,
      O: o
    };
  }
}