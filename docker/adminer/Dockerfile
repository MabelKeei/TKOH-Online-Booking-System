# 自定义 Adminer：容器内监听 3201（与宿主机映射一致，参考 VisitorSystem 结构）
FROM adminer:latest

USER root
RUN apk add --no-cache gettext

RUN echo '#!/bin/sh' > /usr/local/bin/start-adminer.sh && \
    echo 'export ADMINER_DEFAULT_SERVER="postgres"' >> /usr/local/bin/start-adminer.sh && \
    echo 'export ADMINER_DESIGN="pepa-linha-dark"' >> /usr/local/bin/start-adminer.sh && \
    echo 'exec php -S 0.0.0.0:3201 -t /var/www/html' >> /usr/local/bin/start-adminer.sh && \
    chmod +x /usr/local/bin/start-adminer.sh

USER adminer

EXPOSE 3201

CMD ["/usr/local/bin/start-adminer.sh"]
