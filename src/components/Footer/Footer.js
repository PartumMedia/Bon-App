import React from "react";
import style from "./Footer.module.scss";

function Footer() {
  return (
    <div className={style.Footer}>
      <p>&copy; PartumMedia 2019. ALL RIGHTS RESERVED</p>
      <p className={style.Designer}>PartumMedia</p>
    </div>
  );
}

export default Footer;
