import { forwardRef } from "react";
import { Icon } from "@iconify/react";

import Box from "@mui/material/Box";

// ----------------------------------------------------------------------

interface Props {
  icon: React.ReactElement | string;
  sx: any;
  width: number;
}

// eslint-disable-next-line react/display-name
const Iconify = forwardRef(({ icon, width = 20, sx, ...other }: Props, ref) => (
  <Box
    ref={ref}
    component={Icon}
    className="component-iconify"
    icon={icon}
    sx={{ width, height: width, ...sx }}
    {...other}
  />
));
export default Iconify;
