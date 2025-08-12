FROM nginx:alpine

# Copy SSL certificates
COPY nginx-https.conf /etc/nginx/conf.d/default.conf

# Create SSL directory and copy certificates
RUN mkdir -p /etc/ssl/cyberforge

# Copy the built React app
COPY --from=cyberlab-frontend /usr/share/nginx/html /usr/share/nginx/html

# Expose ports
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
