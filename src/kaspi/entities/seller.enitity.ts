import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Seller {
  @PrimaryGeneratedColumn()
  public readonly id: number;

  @Column({ nullable: true })
  public readonly name: string;

  @Column({ nullable: true })
  info: any;
}
