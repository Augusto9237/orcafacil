import { db } from './config';
import { doc, runTransaction } from 'firebase/firestore';

export async function proximoNumero(
  usuarioId: string,
  tipo: 'orcamento' | 'os'
): Promise<string> {
  const contadorRef = doc(db, 'contadores', usuarioId);
  const campo = tipo === 'orcamento' ? 'seqOrcamento' : 'seqOs';
  const prefixo = tipo === 'orcamento' ? 'ORC' : 'OS';
  const ano = new Date().getFullYear();

  const novoSeq = await runTransaction(db, async (transaction) => {
    const docSnap = await transaction.get(contadorRef);
    const seq = docSnap.exists() ? (docSnap.data()[campo] ?? 0) + 1 : 1;
    transaction.set(contadorRef, { [campo]: seq }, { merge: true });
    return seq;
  });

  return `${prefixo}-${ano}-${String(novoSeq).padStart(4, '0')}`;
}
