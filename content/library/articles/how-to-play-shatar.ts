import type { Article } from "@/lib/library";

export const article: Article = {
  slug: "how-to-play-shatar",
  title: "How to play shatar",
  excerpt:
    "A complete primer on Mongolian chess — the pieces, the moves, the rules that make it shatar, and why we named this community after a single one of its verbs.",
  tag: "Primer",
  author: "Obi",
  date: "2026-05-21",
  readMinutes: 9,
  body: [
    {
      type: "intro",
      text: "Shatar is the chess Mongolians played for centuries before Western chess arrived. Same family of game — kings, knights, pawns — but with quieter rules, slower pawns, and a different shape to the opening. We named this community after a single word in its vocabulary: нүү — to move.",
    },

    { type: "h2", text: "A short history" },
    {
      type: "p",
      text: "Chess reached the Mongol world by the 13th century, traveling north from India and Persia along the same trade routes that brought silk, paper, and Buddhism. The Indian chaturanga and the Persian chatrang were the parent games. The Mongols absorbed the rules, reshaped them to fit a nomadic court, and pushed the result across half of Asia.",
    },
    {
      type: "p",
      text: "Shatar is what crystallized. It kept the central idea — two players moving turn-by-turn on a square grid, each trying to mate the other's king — but slowed the pawn march, restricted certain pieces, and added rituals around announcing the state of the game. By the time European chess developed castling and the two-square pawn jump in the 15th century, the Mongol game had already settled into its own rhythm.",
    },
    {
      type: "p",
      text: "Today shatar is played mostly in the countryside and at festivals; international chess (FIDE rules) is the dominant tournament game in Ulaanbaatar. But the words and habits survive. People still talk about шак and туг. Older players still teach by setting up a board on the floor of a ger.",
    },

    { type: "h2", text: "The board" },
    {
      type: "p",
      text: "Eight columns, eight rows, sixty-four squares, alternating light and dark. Western chess uses algebraic notation (a1, h8); shatar traditionally does not. You point at squares; you don't name them. The board sits in whatever orientation makes sense at the table, with the host's Bers on her color and the Noyon on the other.",
    },

    { type: "h2", text: "The pieces" },
    {
      type: "p",
      text: "Six unique pieces, mirrored on both sides. Western chess players will recognize each by its movement; the names come from the steppe.",
    },
    { type: "shatar-pieces" },

    { type: "h2", text: "How they move" },
    {
      type: "p",
      text: "Below are move diagrams for each piece. The green dots are squares the piece can move to. Empty squares are unreachable in a single move. Sliding pieces (Bers, Tem, Tereg) continue until they hit a piece or the edge of the board — diagrams show the first three squares for clarity.",
    },

    {
      type: "shatar-move",
      pieceId: "noyon",
      caption:
        "Noyon — one square in any direction. The king never moves further than one step.",
    },
    {
      type: "shatar-move",
      pieceId: "bers",
      caption:
        "Bers — any number of squares along any rank, file, or diagonal. The strongest piece on the board.",
    },
    {
      type: "shatar-move",
      pieceId: "tem",
      caption:
        "Tem — any number of squares diagonally. A Tem stays on its starting color all game.",
    },
    {
      type: "shatar-move",
      pieceId: "morin",
      caption:
        "Morin — two squares in one direction, one square perpendicular. The only piece that leaps over other pieces.",
    },
    {
      type: "shatar-move",
      pieceId: "tereg",
      caption:
        "Tereg — any number of squares along a rank or file. Straight lines only.",
    },
    {
      type: "shatar-move",
      pieceId: "khuu",
      caption:
        "Khüü — one square forward. Captures diagonally forward, never head-on. No two-square first move.",
    },

    { type: "h2", text: "Standard rules of play" },
    {
      type: "p",
      text: "Rules shatar shares with Western chess. If you have played one game you have played both.",
    },
    {
      type: "ul",
      items: [
        "Two players. One side moves first (in most traditions, white).",
        "Players alternate single moves. You cannot skip your turn.",
        "Captures by displacement: you move your piece onto an enemy square and remove the enemy piece from the board.",
        "You cannot move into check — putting your own Noyon in danger is illegal.",
        "If your Noyon is in check, your only legal moves are those that resolve the check (block, capture the attacker, or move the Noyon).",
        "Checkmate — your Noyon is in check and no legal move resolves it — ends the game.",
      ],
    },

    { type: "h2", text: "What makes shatar shatar" },
    {
      type: "p",
      text: "A handful of rules differ from Western chess. Together they give the game its slower, more deliberate feel.",
    },
    {
      type: "ul",
      items: [
        "Khüü walk one square at a time. No two-square first move. The opening unfolds slowly.",
        "No castling. The Noyon defends himself; you cannot hide him behind a fortress of pawns.",
        "No en passant. Khüü cannot capture in passing because they cannot move two squares anyway.",
        "Stalemate is a loss for the stalemated side, not a draw. Running your opponent out of moves is a win.",
        "Pawn promotion is only to a Bers. No underpromotion to Morin or Tereg.",
        "Mandatory check declaration: you say \"шак\" (shak) aloud when you put the enemy Noyon in check.",
        "Mandatory mate declaration: you say \"туг\" (tug) aloud when you deliver checkmate. Saying the word is part of the move.",
      ],
    },
    {
      type: "p",
      text: "The check declaration is the most striking difference for an outsider. In Western chess, announcing check is a beginner's courtesy that strong players drop. In shatar, the spoken word is part of the legal move. A check delivered in silence has not been delivered at all.",
    },

    { type: "h2", text: "The opening setup" },
    {
      type: "p",
      text: "Pieces line up identically on both sides. From a corner toward the middle: Tereg, Morin, Tem, Bers, Noyon, Tem, Morin, Tereg. The Khüü sit on the second rank, all eight of them.",
    },
    {
      type: "shatar-board",
      caption: "Standard shatar opening setup",
    },

    { type: "h2", text: "A common opening" },
    {
      type: "p",
      text: "Because pawns move one square, the opening is slower than Western chess. Pieces have to come around them rather than through them. Common patterns: develop Tem and Morin early so they can reach the center, push central Khüü to claim space, keep the Noyon centered until danger forces him sideways.",
    },
    {
      type: "p",
      text: "There is no shatar equivalent of the King's Indian or the Sicilian. The opening tradition is oral and idiosyncratic — taught between players, not written down. The best opening is the one your father plays.",
    },

    { type: "h2", text: "Strategy in short" },
    {
      type: "ul",
      items: [
        "Control the center, but slowly. You will have many moves before the position locks in.",
        "Develop your Morins before your Tems. The horse is the only piece that can leap over the slow pawn wall.",
        "Trade aggressively when you are ahead. Trade conservatively when you are behind.",
        "Watch for stalemate. Because stalemate is a loss for the stalemated side, you can win drawish endgames that Western chess would call a draw.",
        "Remember: you must say шак. Plan a move that delivers check, and rehearse the word in your head before you commit. Forgetting is illegal.",
      ],
    },

    { type: "h2", text: "Why we kept the verb" },
    {
      type: "p",
      text: "Shatar is a game where you cannot make many moves at once. You see the board, you wait your turn, you commit, you live with the consequence. The pieces don't all start equal in power, but each of them moves under the same constraint: one move per turn.",
    },
    {
      type: "p",
      text: "Building a thing — a company, a craft, a community — has the same shape. Most of the time you are watching, listening, planning. Then it is your turn. You move. The position changes.",
    },

    { type: "h2", text: "Where to play" },
    {
      type: "p",
      text: "Online, options are thin. Most chess platforms only support FIDE rules. SkillChess has a shatar variant; the Lichess community occasionally hosts unofficial shatar studies.",
    },
    {
      type: "p",
      text: "Offline is better. Find another Mongolian and set up a board between two cups of tea. The board is the same as a Western chessboard; you teach the rule differences in two minutes. That is the real game.",
    },

    { type: "h2", text: "A note on the visuals" },
    {
      type: "p",
      text: "Chess pieces in this article are the open-source SVG set by Colin M.L. Burnett (Cburnett on Wikipedia), licensed CC-BY-SA 3.0. They are the same pieces used by Lichess, Wikipedia, and most of the world's open-source chess software. We bundle them locally from the lichess-org/lila repository.",
    },
    {
      type: "p",
      text: "Hand-painted pixel-art shatar tokens — with proper Noyon hats and camel humps — are on the roadmap. For now, the Cburnett pieces stand in.",
    },

    {
      type: "quote",
      text: "Нүү. Your move.",
    },
  ],
};
