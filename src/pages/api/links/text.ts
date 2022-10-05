import { NextApiRequest, NextApiResponse } from 'next'
import * as X from 'next-axiom'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    // res.status(200).json({ name: 'John Doe' })
    X.log.debug('🌽', { sopa: 'telegrama' })
    res.redirect('https://t.me/phaunus')
}
