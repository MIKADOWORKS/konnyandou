import * as Payjp from 'payjp';

let _payjp: Payjp.Payjp | null = null;

export function getPayjp(): Payjp.Payjp {
  if (!_payjp) {
    const factory = Payjp as unknown as Payjp.PayjpStatic;
    _payjp = factory(process.env.PAYJP_SECRET_KEY!);
  }
  return _payjp;
}
