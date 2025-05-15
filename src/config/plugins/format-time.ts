export class FormatTime {
  static formatResponseTime(reportDate: Date, closeDate: Date): string {
    const msDiff = closeDate.getTime() - reportDate.getTime();
    const minutes = Math.floor(msDiff / (1000 * 60));
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    const remainingMinutes = minutes % 60;

    return `${days} día${days !== 1 ? "s" : ""}, ${hours} hora${
      hours !== 1 ? "s" : ""
    }, ${remainingMinutes} minuto${remainingMinutes !== 1 ? "s" : ""}`;

    // const parts = [];
    // if (days > 0) parts.push(`${days} día${days > 1 ? "s" : ""}`);
    // if (hours > 0) parts.push(`${hours} hora${hours > 1 ? "s" : ""}`);
    // if (remainingMinutes > 0)
    //   parts.push(
    //     `${remainingMinutes} minuto${remainingMinutes > 1 ? "s" : ""}`
    //   );

    // return parts.length ? parts.join(", ") : "0 minutos";
  }

  //   formatResponseTimeVerbose(reportDate: Date, closeDate: Date): string {
  //     const msDiff = closeDate.getTime() - reportDate.getTime();
  //     const minutes = Math.floor(msDiff / (1000 * 60));
  //     const days = Math.floor(minutes / 1440);
  //     const hours = Math.floor((minutes % 1440) / 60);
  //     const remainingMinutes = minutes % 60;

  //     return `${days} día${days !== 1 ? "s" : ""}, ${hours} hora${
  //       hours !== 1 ? "s" : ""
  //     }, ${remainingMinutes} minuto${remainingMinutes !== 1 ? "s" : ""}`;
  //   }
}
