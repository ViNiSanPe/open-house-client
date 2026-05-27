import { reqHandler } from '../dist/open-house/server/server.mjs';

export default function (req, res) {
  return reqHandler(req, res);
}
