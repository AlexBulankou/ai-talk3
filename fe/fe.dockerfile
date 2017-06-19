FROM microsoft/dotnet:1.1.1-sdk
RUN mkdir /app
WORKDIR /app

COPY src/. .
RUN dotnet restore
RUN dotnet publish -c Release -o out

EXPOSE 5000
CMD ["dotnet", "out/fe.dll"]