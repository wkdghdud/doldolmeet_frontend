import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Card from "@mui/material/Card";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import SvgColor from "@/components/SvgColor";

// ----------------------------------------------------------------------
export interface Author {
  name: string;
  avatarUrl: string;
}

export interface Post {
  cover: any;
  title: string;
  view: number;
  comment: number;
  share: number;
  author: Author;
  createdAt: string;
}

interface Props {
  post: Post;
  index: number;
}
export default function PostCard({ post, index }: Props) {
  const { cover, title, view, comment, share, author, createdAt } = post;

  const renderAvatar = (
    <Avatar
      alt={author.name}
      src={author.avatarUrl}
      sx={{
        zIndex: 9,
        width: 32,
        height: 32,
        position: "absolute",
        left: (theme) => theme.spacing(3),
        bottom: (theme) => theme.spacing(-2),
      }}
    />
  );

  const renderTitle = (
    <Link
      color="inherit"
      variant="h6"
      underline="hover"
      sx={{
        height: 44,
        overflow: "hidden",
        WebkitLineClamp: 2,
        display: "-webkit-box",
        WebkitBoxOrient: "vertical",
      }}
    >
      {title}
    </Link>
  );

  const renderCover = (
    <Box
      component="img"
      alt={title}
      src={cover}
      sx={{
        top: 0,
        width: 1,
        height: 1,
        objectFit: "cover",
        position: "absolute",
      }}
    />
  );

  const renderDate = (
    <Typography
      variant="h6"
      component="div"
      sx={{
        mb: 2,
        color: "text.disabled",
      }}
    >
      {"05 Mar 2023"}
    </Typography>
  );

  const renderShape = (
    <SvgColor
      color="paper"
      src="/shape-avatar.svg"
      sx={{
        width: 80,
        height: 36,
        zIndex: 9,
        bottom: -15,
        position: "absolute",
        color: "background.paper",
      }}
    />
  );

  return (
    <Card>
      <Box
        sx={{
          position: "relative",
          pt: "calc(100% * 3 / 4)",
        }}
      >
        {renderShape}

        {renderAvatar}

        {renderCover}
      </Box>

      <Box
        sx={{
          p: (theme) => theme.spacing(4, 3, 3, 3),
        }}
      >
        {renderDate}

        {renderTitle}
      </Box>
    </Card>
  );
}
